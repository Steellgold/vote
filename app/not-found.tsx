import { buttonVariants } from "@/components/ui/button";
import { Component } from "@/lib/types";
import { useTranslations } from "next-intl";
import Link from "next/link";

type NotFoundProps = {
  pollNotFound?: boolean;
};

const NotFound: Component<NotFoundProps> = ({ pollNotFound = false }) => {
  const t = useTranslations("NotFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <h2 className="text-3xl font-bold">{t("Title")}</h2>

      <p className="mb-4">
        {pollNotFound ? t("PollNotFound") : t("PageNotFound")}
      </p>

      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        {t("BackHome")}
      </Link>
    </div>
  )
}

export default NotFound;