'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets } from '@/data/tickets';
import type { BuyerInfo } from '@/types/checkout';
import Image from 'next/image';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const ticket = tickets.find((t) => t.id === ticketId);

  useEffect(() => {
    const buyer = sessionStorage.getItem(`checkout_buyer_${ticketId}`);
    const order = sessionStorage.getItem(`checkout_order_${ticketId}`);
    const qtyStr = sessionStorage.getItem(`checkout_quantity_${ticketId}`) || '1';

    // If no order ID, they didn't complete payment — send home
    if (!order || !buyer) {
      router.replace('/');
      return;
    }

    const parsedBuyer: BuyerInfo = JSON.parse(buyer);
    setBuyerInfo(parsedBuyer);
    setOrderId(order);
    setQuantity(parseInt(qtyStr, 10));

    // Generate QR from order ID using a free QR API
    const qrData = encodeURIComponent(
      JSON.stringify({ orderId: order, ticketId, email: parsedBuyer.email })
    );
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`);

    // Clean up session data after reading
    sessionStorage.removeItem(`checkout_buyer_${ticketId}`);
    sessionStorage.removeItem(`checkout_order_${ticketId}`);
    sessionStorage.removeItem(`checkout_quantity_${ticketId}`);
  }, [ticketId, router]);

  function handleShare(method: 'copy' | 'whatsapp' | 'instagram') {
    const message = `¡${ticket?.stock === undefined ? 'Mesa' : 'Boleta'} asegurada! 🎉\n${ticket?.name}${ticket?.stock === undefined ? ` #${ticket?.number}` : ''}\nOrden: ${orderId}\nMuestra este QR en la entrada.`;

    if (method === 'copy') {
      navigator.clipboard.writeText(qrUrl);
      alert('Enlace del QR copiado');
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else if (method === 'instagram') {
      navigator.clipboard.writeText(message);
      alert('Mensaje copiado — pégalo en Instagram');
    }
  }

  if (!buyerInfo || !ticket) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center">

      <div className="w-full max-w-sm bg-white shadow-sm overflow-hidden">

        {/* Hero image */}
        {ticket.img && (
          <div className="w-full h-32 overflow-hidden relative">
            <img src={`/${ticket.img}`} alt={ticket.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/background/background-finalcompra.png"
                alt="Boho Sunday"
                width={140}
                height={30}
                className="object-contain"
              />
            </div>
          </div>
        )}

        <div className="px-5 py-5 text-center">

          <h2 className="font-displayFlyer text-[20px] text-[#231E1A] leading-tight mb-1">
            ¡Tu pago ha sido<br />exitoso!
          </h2>
          {/* Success icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11L8.5 15.5L18 6" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-nunito text-[12px] text-[#9B9389] mb-1">
            Orden: <span className="font-semibold text-[#5A5248]">{orderId}</span>
          </p>
          <p className="font-nunito text-[12px] text-[#9B9389] mb-4">
            {ticket.name}{ticket.stock === undefined ? ` #${ticket.number}` : ''} · {ticket.stock === undefined ? ticket.persons : quantity} {(ticket.stock === undefined ? ticket.persons : quantity) === 1 ? 'acceso' : 'accesos'}
          </p>

          <div className="bg-[#686A54]/8 border border-[#686A54]/20 rounded-xl px-4 py-3 mb-4 mx-2">
            <p className="font-nunito text-[12px] text-[#686A54] leading-relaxed text-center">
              Te hemos enviado un correo de confirmación con tu código QR a:<br />
              <strong className="text-[#231E1A]">{buyerInfo.email}</strong>
            </p>
          </div>

          {/* QR */}
          {qrUrl && (
            <div className="bg-[#BDB39B] rounded-2xl p-4 mx-auto w-fit mb-3">
              <img src={qrUrl} alt="QR de acceso" width={160} height={160} className="rounded-lg" />
            </div>
          )}

          <p className="font-nunito text-[12px] text-[#5A5248] leading-relaxed mb-4">
            Tu {ticket.stock === undefined ? 'mesa tiene' : 'reserva es válida para'} <strong>{ticket.stock === undefined ? ticket.persons : quantity} {(ticket.stock === undefined ? ticket.persons : quantity) === 1 ? 'acceso' : 'accesos'}</strong>.<br />
            Envía el QR a tus invitados o comparte este enlace para mandarlo a tu grupo de WhatsApp.
          </p>

          {/* Share buttons */}
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E0D9D0] font-nunito text-[12px] text-[#5A5248] hover:bg-[#FAF8F5] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copiar link
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E0D9D0] font-nunito text-[12px] text-[#5A5248] hover:bg-[#FAF8F5] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          <button
            onClick={() => router.replace('/')}
            className="w-full py-3 rounded-xl border border-[#E0D9D0] font-nunito text-[15px] bg-[#686A54] text-[#F4EFE9]  uppercase font-semibold hover:bg-[#FAF8F5] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}