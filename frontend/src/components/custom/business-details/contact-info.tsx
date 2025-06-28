import { Business } from "@/services/businesses";
import { Globe, MapPin, Phone } from "lucide-react";
import Link from "next/link";


interface ContactInfoProps {
  business: Business;
}

export default function ContactInfo(props: ContactInfoProps){
    return (
        <div className="space-y-2">
          <h2 className="font-bold text-3xl text-gray-800">Coordonnées</h2>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-gray-800">
              {props.business.location}
            </span>
          </div>
          {props.business.number ? <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="text-gray-700">{props.business.number}</span>
          </div> : null}   
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <Link href={props.business.website} className="text-gray-700 hover:text-blue-700 transition duration-300" target="_blank">Voir en ligne</Link>
          </div>
        </div>
    )
}