import { cleanupExpiredJobs } from "@/lib/files/temp-storage";

cleanupExpiredJobs().then(() => console.log("Expired FonixsPDF jobs removed.")).catch((error) => {
  console.error(error); process.exitCode = 1;
});
