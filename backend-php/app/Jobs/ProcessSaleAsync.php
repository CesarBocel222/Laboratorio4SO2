<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ProcessSaleAsync implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $ventaId;
    public $tries = 3;

    public function __construct($ventaId)
    {
        $this->ventaId = $ventaId;
        $this->onQueue('background');
    }

    public function handle()
    {
        // =====================================================
        // ERRORES INTENCIONALES PARA AUDITORÍA TÉCNICA (Lab 4)
        // =====================================================

        try {
            // 1. Consulta larga y sin caché
            $venta = DB::table('ventas')->where('id_venta', $this->ventaId)->first();
            if (!$venta) {
                throw new Exception("Venta {$this->ventaId} no existe en la base de datos");
            }

            if ($venta->estado_facturacion !== 'PENDIENTE') {
                Log::warning("Venta ya procesada: {$this->ventaId}");
                return;
            }

            // 2. Preparación de datos duplicada y sin abstracción
            $detalle = DB::table('detalle_venta')
                ->where('id_venta', $this->ventaId)
                ->get();

            $payloadSat = [
                'id_venta'   => $this->ventaId,
                'subtotal'   => $venta->subtotal,
                'iva'        => $venta->iva,
                'total'      => $venta->total,
                'detalle'    => $detalle->toArray(),
                'fecha'      => $venta->fecha,
            ];

            // 3. Llamada SAT – anidamiento profundo + duplicación lógica
            $responseSat = Http::timeout(15)->post('https://api.sat.gt/fel/timbrar', $payloadSat);

            if ($responseSat->successful()) {
                $data = $responseSat->json();
                if (isset($data['codigo_timbrado']) && $data['codigo_timbrado']) {
                    DB::table('ventas')
                        ->where('id_venta', $this->ventaId)
                        ->update(['estado_facturacion' => 'TIMBRADO']);
                } else {
                    if ($this->attempts() < $this->tries) {
                        $this->release(60); // backoff fijo – error intencional
                    } else {
                        throw new Exception("Timbrado fallido sin código: " . json_encode($data));
                    }
                }
            } else {
                $status = $responseSat->status();
                if ($status === 429 || $status === 503) {
                    if ($this->attempts() < $this->tries) {
                        $this->release(60);
                    } else {
                        throw new Exception("Servicio SAT no disponible: $status");
                    }
                } else {
                    throw new Exception("Error SAT {$status}: " . $responseSat->body());
                }
            }

            // 4. Lógica casi idéntica para contable (duplicación intencional)
            if ($venta->estado_facturacion === 'TIMBRADO') {  // chequeo redundante
                $payloadContable = [
                    'venta_id'   => $this->ventaId,
                    'total'      => $venta->total,
                    'fecha'      => $venta->fecha,
                    'detalle'    => $detalle->toArray(),
                ];

                $responseCont = Http::timeout(20)->post('https://api.contable.gt/sync', $payloadContable);

                if ($responseCont->successful()) {
                    $data = $responseCont->json();
                    if (isset($data['sync_id']) && $data['sync_id']) {
                        DB::table('ventas')
                            ->where('id_venta', $this->ventaId)
                            ->update(['estado_facturacion' => 'SINCRONIZADO']);
                    } else {
                        if ($this->attempts() < $this->tries) {
                            $this->release(60);
                        } else {
                            throw new Exception("Sync contable fallido");
                        }
                    }
                } else {
                    throw new Exception("Error contable: " . $responseCont->body());
                }
            }

        } catch (Exception $e) {
            // 5. Error handling pobre – solo log y rethrow
            Log::error("Fallo en ProcessSaleAsync #{$this->ventaId}: " . $e->getMessage());
            throw $e;  // Laravel reintentará automáticamente según $tries
        }
    }
}