import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { nombreCompleto, email, telefono } = await request.json();

    if (!nombreCompleto || !email || !telefono) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el email o el teléfono ya existen en la base de datos
    const { data: existingUsers, error: checkError } = await supabase
      .from('pre_register')
      .select('email, telefono')
      .or(`email.eq.${email.trim()},telefono.eq.${telefono.trim()}`);

    if (checkError) {
      console.error('Error verificando duplicados en Supabase:', checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      const hasEmail = existingUsers.some(u => u.email === email.trim());
      const hasPhone = existingUsers.some(u => u.telefono === telefono.trim());

      if (hasEmail && hasPhone) {
        return NextResponse.json(
          { error: 'Este correo electrónico y número de teléfono ya se encuentran registrados' },
          { status: 400 }
        );
      } else if (hasEmail) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya se encuentra registrado' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Este número de teléfono ya se encuentra registrado' },
          { status: 400 }
        );
      }
    }

    // Insertar el registro en la tabla de Supabase creada (pre_register)
    // Usamos el nombre de columna exacto de la base de datos (nombre_completo, email, telefono)
    const { data, error } = await supabase
      .from('pre_register')
      .insert([
        {
          nombre_completo: nombreCompleto,
          email: email,
          telefono: telefono,
        },
      ])
      .select();

    if (error) {
      console.error('Error insertando en Supabase:', error);
      return NextResponse.json(
        { error: 'Error al registrar en la base de datos: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Registro completado exitosamente', data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error en API pre-register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}
