'use client';

import { useEffect, useState } from 'react';

interface EditionData {
  id: string;
  year: string;
  date: string;
  title: string;
  folder: string;
  images: string[];
}

const EDITIONS_LIST: EditionData[] = [
  { 
    id: '1', 
    year: '2026', 
    date: '26 JUL', 
    title: 'COLOMBIAMODA EDITION', 
    folder: 'colombiamoda-edition',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg'
    ]
  },
  { 
    id: '2', 
    year: '2026', 
    date: '26 ABR', 
    title: 'WILD TROPIC', 
    folder: 'wild-tropic',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg', 'Rectangle 17.jpg'
    ]
  },
  { 
    id: '3', 
    year: '2026', 
    date: '25 ENE', 
    title: 'NEW YEAR EDITION', 
    folder: 'new-year',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg'
    ]
  },
  { 
    id: '4', 
    year: '2025', 
    date: '23 NOV', 
    title: 'WHITE EDITION II', 
    folder: 'white-edition-ii',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg'
    ]
  },
  { 
    id: '5', 
    year: '2025', 
    date: '27 JUL', 
    title: 'THE RUNWAY EDITION', 
    folder: 'runway-edition',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg'
    ]
  },
  { 
    id: '6', 
    year: '2025', 
    date: '25 MAY', 
    title: 'SUMMER SUNSET', 
    folder: 'summer-sunset',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg'
    ]
  },
  { 
    id: '7', 
    year: '2025', 
    date: '09 MAR', 
    title: 'CARNIVAL', 
    folder: 'carnival',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg', 'Rectangle 17.jpg'
    ]
  },
  { 
    id: '8', 
    year: '2024', 
    date: '01 DIC', 
    title: 'WHITE EDITION', 
    folder: 'white-edition',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg'
    ]
  },
  { 
    id: '9', 
    year: '2024', 
    date: '27 OCT', 
    title: 'FUEGO, ORO Y SOL', 
    folder: 'fuego-oro-sol',
    images: [
      'Rectangle 7.jpg', 'Rectangle 8.jpg', 'Rectangle 9.jpg', 'Rectangle 10.jpg',
      'Rectangle 11.jpg', 'Rectangle 12.jpg', 'Rectangle 13.jpg', 'Rectangle 14.jpg',
      'Rectangle 15.jpg', 'Rectangle 16.jpg', 'Rectangle 17.jpg'
    ]
  },
];

const getEditionImagePaths = (edition: EditionData) =>
  edition.images.map((img) => {
    const imageName = img.replace(/\.[^.]+$/, '.webp');
    return `/images/editions-optimized/${edition.folder}/${imageName}`;
  });

const preloadImages = (srcList: string[]) => {
  srcList.forEach((src) => {
    const image = new window.Image();
    image.src = src;
  });
};

const CarouselImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    if (src === displaySrc) {
      return;
    }

    const image = new window.Image();
    image.src = src;

    const showImage = () => setDisplaySrc(src);

    if (image.decode) {
      image.decode().then(showImage).catch(showImage);
    } else {
      image.onload = showImage;
      image.onerror = showImage;
    }
  }, [displaySrc, src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
};

const SmartImage = ({ srcOptions, alt, className }: { srcOptions: string[]; alt: string; className?: string }) => {
  const [srcIndex, setSrcIndex] = useState(0);

  const handleError = () => {
    if (srcIndex < srcOptions.length - 1) {
      setSrcIndex((prev) => prev + 1);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcOptions[srcIndex]}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export const Editions = () => {
  const [activeEditionId, setActiveEditionId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const firstVisibleImages = EDITIONS_LIST.flatMap((edition) =>
      getEditionImagePaths(edition).slice(0, 3)
    );

    const preloadInitialImages = () => preloadImages(firstVisibleImages);

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadInitialImages);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(preloadInitialImages, 300);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const activeEdition = EDITIONS_LIST.find((edition) => edition.id === activeEditionId);

    if (activeEdition) {
      preloadImages(getEditionImagePaths(activeEdition));
    }
  }, [activeEditionId]);

  const toggleEdition = (id: string) => {
    setActiveEditionId(activeEditionId === id ? null : id);
    if (!carouselIndex[id]) {
      setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const nextImage = (editionId: string, totalCount: number) => {
    setCarouselIndex((prev) => {
      const current = prev[editionId] || 0;
      // Avanzamos de 1 en 1 foto para un desplazamiento continuo natural
      const nextIndex = (current + 1) % totalCount;
      return { ...prev, [editionId]: nextIndex };
    });
  };

  const prevImage = (editionId: string, totalCount: number) => {
    setCarouselIndex((prev) => {
      const current = prev[editionId] || 0;
      // Retrocedemos de 1 en 1 foto para un desplazamiento continuo natural
      const prevIndex = (current - 1 + totalCount) % totalCount;
      return { ...prev, [editionId]: prevIndex };
    });
  };

  return (
    <div className="w-full bg-[#F4EFE9] flex flex-col items-center py-10 px-4 md:px-10 select-none">
      <h2 className="text-[#231E1A] text-[28px] md:text-[34px] font-bold font-averia text-center pb-8 uppercase tracking-wide">
        EDICIONES
      </h2>

      <div className="w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl flex flex-col gap-5">
        {EDITIONS_LIST.map((edition) => {
          const isActive = activeEditionId === edition.id;
          
          // Mapear los nombres de archivo estáticos a rutas relativas del proyecto
          const images = getEditionImagePaths(edition);
          const totalCount = images.length;

          const currentIdx = carouselIndex[edition.id] || 0;
          const nextIdx = totalCount > 0 ? (currentIdx + 1) % totalCount : 0;
          const nextNextIdx = totalCount > 0 ? (currentIdx + 2) % totalCount : 0;

          const webBannerOptions = [
            `/images/editions/${edition.folder}/banner-web.svg`,
            `/images/editions/${edition.folder}/banner-web.png`,
            `/images/editions/${edition.folder}/banner-web.png.png`,
            `/images/editions/${edition.folder}/banner-web.png.jpg`,
            `/images/editions/${edition.folder}/banner-web.jpg`
          ];

          const mobileBannerOptions = [
            `/images/editions/${edition.folder}/banner-movil.png.png`,
            `/images/editions/${edition.folder}/banner-movil.png`,
            `/images/editions/${edition.folder}/banner-movil.svg`,
            `/images/editions/${edition.folder}/banner-movil.png.jpg`,
            `/images/editions/${edition.folder}/banner-movil.jpg`
          ];

          return (
            <div key={edition.id} className="w-full flex flex-col">
              {/* Botón / Banner */}
              <button
                onClick={() => toggleEdition(edition.id)}
                className="w-full relative overflow-hidden rounded-xl focus:outline-none transition duration-300 hover:scale-[1.01] shadow-sm"
              >
                <SmartImage
                  srcOptions={webBannerOptions}
                  alt={edition.title}
                  className="hidden md:block w-full h-auto object-contain"
                />
                <SmartImage
                  srcOptions={mobileBannerOptions}
                  alt={edition.title}
                  className="block md:hidden w-full h-auto object-contain"
                />
              </button>

              {/* Contenido Desplegable */}
              {isActive && (
                <div className="w-full bg-[#F4EFE9] flex flex-col items-center py-6 mt-2 rounded-xl">
                  {/* Encabezado del Desplegable */}
                  <div className="w-full relative flex items-center justify-center mb-2 px-4">
                    <h3 className="text-[#231E1A] text-[22px] md:text-[26px] font-bold font-averia uppercase tracking-wide">
                      ASÍ SE VIVIÓ
                    </h3>
                    <button
                      onClick={() => toggleEdition(edition.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#231E1A] text-white rounded-full p-1.5 hover:bg-black transition duration-200 flex items-center justify-center w-8 h-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                  </div>
                  <p className="text-[#231E1A] text-sm md:text-base font-nunito uppercase tracking-widest mb-6">
                    {edition.title}
                  </p>

                  {/* Carrusel de Imágenes */}
                  {images.length > 0 ? (
                    <div className="relative w-full flex items-center justify-center">
                      
                      {/* Contenedor Flex de Imágenes */}
                      <div className="w-full flex justify-center items-center gap-4 overflow-hidden relative">
                        {/* Imagen 1 - Izquierda (Completa en Desktop - 40% de ancho) */}
                        <div className="hidden md:block w-[40%] h-[350px] lg:h-[450px] rounded-2xl overflow-hidden relative group">
                          <CarouselImage
                            src={images[currentIdx]}
                            alt="Foto activa 1"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          
                          {/* Botón Izquierda sobrepuesto en el extremo izquierdo de la primera foto */}
                          <button
                            onClick={() => prevImage(edition.id, images.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-black p-2.5 rounded-full shadow-lg transition duration-200 flex items-center justify-center hover:scale-110"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          </button>
                        </div>

                        {/* Imagen 2 - Central (Completa en Desktop, Única en Móvil - 40% de ancho) */}
                        <div className="w-full md:w-[40%] h-[320px] md:h-[350px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl relative group">
                          <CarouselImage
                            src={images[nextIdx]}
                            alt="Foto activa 2"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          
                          {/* Botón Izquierda en móvil (solo se muestra en pantallas pequeñas) */}
                          <button
                            onClick={() => prevImage(edition.id, images.length)}
                            className="absolute md:hidden left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-black p-2.5 rounded-full shadow-lg transition duration-200 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          </button>

                          {/* Botón Derecha en móvil (solo se muestra en pantallas pequeñas) */}
                          <button
                            onClick={() => nextImage(edition.id, images.length)}
                            className="absolute md:hidden right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-black p-2.5 rounded-full shadow-lg transition duration-200 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </button>
                        </div>

                        {/* Imagen 3 - Derecha (Cortada a la mitad en Desktop - 20% de ancho) */}
                        <div className="hidden md:block w-[20%] h-[350px] lg:h-[450px] rounded-2xl overflow-hidden relative group opacity-60 hover:opacity-85 transition-opacity duration-300">
                          <CarouselImage
                            src={images[nextNextIdx]}
                            alt="Preview siguiente"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />

                          {/* Botón Derecha sobrepuesto en el extremo derecho (sobre la foto cortada) */}
                          <button
                            onClick={() => nextImage(edition.id, images.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-black p-2.5 rounded-full shadow-lg transition duration-200 flex items-center justify-center hover:scale-110"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <p className="text-gray-400 font-nunito italic text-sm py-4">
                      Próximamente fotos del evento.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
