import Link from "next/link";
//revisar el w-90

export const Navbar = () => {
  return (
    <nav className="flex fixed top-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-[#D9D1C0] bg-opacity-30 px-5 py-5 rounded-xl z-999"> 

        <div className="flex-1 w-32">
            <Link href="/">
                <img className="" src="/images/logo/logo-boho-horizontal.png" alt="Boho Sunday" />
            </Link>
      
        </div>
        <div className="flex flex-1 w-24 justify-end">
            <span className="text-[#BDB39B] mx-4">ES</span> 
            <span className="text-[#231E1A]">EN</span>
        </div>

    </nav>
  );
};


