import { processEmptyDescriptions } from "@/lib/scrapping/spareroom-front";

processEmptyDescriptions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
