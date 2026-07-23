<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class MotoristaAuthController extends Controller
{
    /**
     * Activar cuenta de motorista.
     *
     * Valida solo el N° de expediente, genera PIN temporal de 4 dígitos.
     */
    public function activarCuenta(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero_expediente' => ['required', 'string', 'max:50'],
        ]);

        $motorista = Motorista::where('numero_empleado', $data['numero_expediente'])->first();

        if (! $motorista) {
            return response()->json([
                'status' => false,
                'message' => 'El número de expediente no fue encontrado en nuestros registros.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (! $motorista->activo) {
            return response()->json([
                'status' => false,
                'message' => 'Tu cuenta de motorista no está activa. Contacta al administrador.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($motorista->trashed()) {
            return response()->json([
                'status' => false,
                'message' => 'El expediente no fue encontrado en nuestros registros.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = $motorista->user;

        if (! $user) {
            $username = "motorista_{$motorista->numero_empleado}";
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = "motorista_{$motorista->numero_empleado}_{$counter}";
                $counter++;
            }

            $correo = $motorista->correo ?? "motorista_{$motorista->numero_empleado}@asamblea.gob.sv";

            $user = User::create([
                'name' => $motorista->nombre,
                'username' => $username,
                'email' => $correo,
                'password' => bcrypt('password'),
                'debe_cambiar_password' => true,
            ]);

            $user->assignRole('motorista');

            $motorista->update(['user_id' => $user->id]);
        }

        if (! $user->debe_cambiar_password) {
            return response()->json([
                'status' => false,
                'message' => 'Esta cuenta ya fue activada. Por favor inicia sesión directamente.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $pin = str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);

        $user->update([
            'password' => Hash::make($pin),
            'debe_cambiar_password' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'PIN temporal generado exitosamente.',
            'data' => [
                'nombre' => $motorista->nombre,
                'username' => $user->username,
                'pin_temporal' => $pin,
            ],
        ]);
    }

    /**
     * Establecer PIN definitivo (después de primer login con PIN temporal).
     */
    public function cambiarPinInicial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pin' => ['required', 'string', 'regex:/^\d{4}$/'],
            'pin_confirmation' => ['required', 'string', 'same:pin'],
        ]);

        $user = $request->user();

        if (! $user->debe_cambiar_password) {
            return response()->json([
                'status' => false,
                'message' => 'Tu PIN ya fue configurado.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->update([
            'password' => Hash::make($data['pin']),
            'debe_cambiar_password' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'PIN configurado correctamente.',
        ]);
    }
}
