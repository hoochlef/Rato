import ExpandableText from "../helpers/expandable-text";

interface AboutProps {
  businessDesc: string;
}

export default function About(props: AboutProps){
    return (
        <div className="space-y-2 mb-5">
          <h2 className="font-bold text-3xl text-gray-800">À propos de l'entreprise</h2>
          <ExpandableText
            text={props.businessDesc}
            maxLength={150}
          />
        </div>
    )
}