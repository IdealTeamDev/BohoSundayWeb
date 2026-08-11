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

    // Insertar el registro en la tabla de Supabase creada (pre_register)
    // Usamos el nombre de columna exacto de la base de datos (Nombre_completo, email, telefono)
    const { data, error } = await supabase
      .from('pre_register')
      .insert([
        {
          Nombre_completo: nombreCompleto,
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
