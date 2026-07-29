


export default function BannerVideo() {
  return(<div className="w-full overflow-hidden">
      {/*Visible solo en pantallas pequeñas */}
      <div className="block md:hidden w-full">
        <video
          src="/video/Bannerprincipalmovil.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          className="w-full h-auto object-cover"
        />
      </div>
      {/* Visible en pantallas medianas y grandes)*/}
      <div className="hidden md:block w-full">
        <video
          src="/video/Bannerprincipal.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          className="w-full h-auto object-cover"
        />
      </div>
    </div>); 
}
