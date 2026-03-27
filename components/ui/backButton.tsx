import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton(){
    const router = useRouter();
    return(
        <button onClick={()=>router.back()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
    )
}