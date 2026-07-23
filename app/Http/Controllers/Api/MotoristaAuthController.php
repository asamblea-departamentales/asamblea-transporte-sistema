<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MotoristaAuthController extends Controller
{
    /**
     * Activar cuenta de motorista (primera vez).
     *
     * Valida expediente + teléfono, genera PIN temporal y lo retorna en pantalla.
     */
    public function activarCuenta(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero_expediente' => ['required', 'string', 'max:50'],
            'telefono' => ['required', 'string', 'max:20'],
        ]);

        $telefonoLimpio = preg_replace('/\D/', '', $data['telefono']);

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

        $telefonoMotorista = preg_replace('/\D/', '', $motorista->telefono ?? '');

        if ($telefonoMotorista !== $telefonoLimpio) {
            return response()->json([
                'status' => false,
                'message' => 'El expediente y número de celular no coinciden con nuestros registros.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (! $motorista->user_id) {
            $username = $telefonoLimpio;

            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = "{$telefonoLimpio}{$counter}";
                $counter++;
            }

            $user = User::create([
                'name' => $motorista->nombre,
                'username' => $username,
                'email' => $motorista->correo ?? strtolower(Str::slug($motorista->nombre, '.')).'@asamblea.gob.sv',
                'password' => bcrypt('password'),
                'debe_cambiar_password' => true,
            ]);

            $user->assignRole('motorista');

            $motorista->update(['user_id' => $user->id]);
        } else {
            $user = $motorista->user;

            if (! $user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Error interno: la cuenta de usuario no fue encontrada. Contacta al administrador.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (! $user->debe_cambiar_password) {
                return response()->json([
                    'status' => false,
                    'message' => 'Esta cuenta ya fue activada. Por favor inicia sesión directamente con tu número celular.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $pin = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $usernameFinal = $telefonoLimpio;
        if ($user->username !== $telefonoLimpio) {
            $counter = 1;
            while (User::where('username', $usernameFinal)->where('id', '!=', $user->id)->exists()) {
                $usernameFinal = "{$telefonoLimpio}{$counter}";
                $counter++;
            }
        }

        $user->update([
            'username' => $usernameFinal,
            'password' => Hash::make($pin),
            'debe_cambiar_password' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cuenta verificada exitosamente.',
            'data' => [
                'nombre' => $motorista->nombre,
                'username' => $usernameFinal,
                'pin_temporal' => $pin,
            ],
        ]);
    }

    /**
     * Establecer PIN/contraseña privada definitiva (después de primer login con PIN temporal).
     */
    public function cambiarPinInicial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:4', 'max:50', 'confirmed'],
        ]);

        $user = $request->user();

        if (! $user->debe_cambiar_password) {
            return response()->json([
                'status' => false,
                'message' => 'Tu cuenta ya tiene una contraseña configurada.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->update([
            'password' => Hash::make($data['password']),
            'debe_cambiar_password' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'PIN privado configurado correctamente. Tu cuenta ha sido activada.',
        ]);
    }
}
