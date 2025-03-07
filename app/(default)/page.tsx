import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PconderzoekLogoCard from "./_components/pconderzoek-logo-card";

export default function Home() {
  return (
    <PconderzoekLogoCard>

      <Button
        variant='default'
        className="text-lg w-full"
        asChild
      >
        <Link href="/home">
          Launch Tool
          <ArrowRight className="ml-2 size-5" />
        </Link>
      </Button>

    </PconderzoekLogoCard>
  );
}
