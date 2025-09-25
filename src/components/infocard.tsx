interface CardProps {
  title: string;
  description: string;
}

function InfoCard({ title, description }: CardProps) {
  return (
    <div className="bg-[#171717] border-[#262626] border p-6 rounded-[32px]">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white justify-center">
        {title}
      </h3>
      <p className="text-center mb-4 text-gray-300">{description}</p>
    </div>
  );
}

export default InfoCard;