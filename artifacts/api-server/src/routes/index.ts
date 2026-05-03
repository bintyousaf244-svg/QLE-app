import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analysisRouter from "./analysis";
import grammarRouter from "./grammar";
import morphologyRouter from "./morphology";
import tasreefRouter from "./tasreef";
import tafseerProxyRouter from "./tafseerProxy";
import wordLookupRouter from "./wordLookup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analysisRouter);
router.use(grammarRouter);
router.use(morphologyRouter);
router.use(tasreefRouter);
router.use(tafseerProxyRouter);
router.use(wordLookupRouter);

export default router;
