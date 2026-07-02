'use client';

import React, { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

interface MPCardBrickProps {
  amount: number;
  onSubmit: (param: { selectedPaymentMethod: string; formData: any }) => Promise<void>;
  locale?: string;
}

function MPCardBrickComponent({
  amount,
  onSubmit,
  locale = 'es',
}: MPCardBrickProps) {
  const [initialized, setInitialized] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    if (publicKey) {
      // Use proper locale format for Mercado Pago SDK (es-CO or en-US)
      const mpLocale = locale === 'en' ? 'en-US' : 'es-CO';
      initMercadoPago(publicKey, { locale: mpLocale });
      setInitialized(true);
    }
  }, [publicKey, locale]);

  if (!publicKey) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-center text-red-600 font-nunito text-[14px]">
        Error: la variable <strong>NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</strong> no está configurada.
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-[#E8E2DA] shadow-sm max-w-md mx-auto">
      {sdkError && (
        <div className="p-3 mb-4 border border-red-200 bg-red-50 rounded-lg text-red-600 font-nunito text-[12px] break-all text-left">
          <strong>Error de inicialización SDK:</strong> {sdkError}
          <div className="mt-2 text-[11px] text-gray-500">
            Asegúrate de no estar mezclando credenciales de prueba con producción (ej. clave pública TEST con token de acceso APP_USR).
          </div>
        </div>
      )}
      <Payment
        initialization={{
          amount: amount,
        }}
        customization={{
          visual: {
            style: {
              theme: 'flat', // Sleek flat design matches Boho style
            },
          },
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: 'all',  // PSE Colombia
            ticket: 'all',        // Efecty Colombia
          }
        }}
        onSubmit={async ({ selectedPaymentMethod, formData }) => {
          // Send both the selected method and form details to the parent
          await onSubmit({ selectedPaymentMethod, formData });
        }}
        onError={(error) => {
          console.error('[MPPaymentBrick] Mercado Pago SDK Error:', error);
          setSdkError(JSON.stringify(error) || error.message || 'Error de comunicación del SDK');
        }}
      />
    </div>
  );
}

const MPCardBrick = React.memo(MPCardBrickComponent);
export default MPCardBrick;
