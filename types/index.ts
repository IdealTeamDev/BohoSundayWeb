//esto traducido es el constructor que se crea cuando se hace
//programación orientada a obejtivos, definimos las variables
//y los tipos de datos que estoy van a guardar

//Para que asi la funcion de ticketcard sabra exactamente que propiedades tiene
//para decirle como lucen o se ven esos datos y ya el typescript se encarga de que todas las reglas se cumplan

export type ZoneType = 'vip' | 'backstage' | 'bohemian' | 'oasis' | 'candela' | 'primitivo';

export interface TicketIncluides{

    licor: string;
    agua: number;
    redBull: number;
    extra?: string;

}

export interface Ticket{

    id: string;
    zone: ZoneType;
    name: string;
    number: number;
    persons: number;
    price: number;
    currency: string;
    includes: TicketIncluides;
    available: boolean;
    position: { x:number; y:number}; //posicion del mapa

}