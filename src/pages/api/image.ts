import { getCache, setCache } from "../../clients/redis";
import { renderLayoutToSVG, renderSVGToPNG } from "../../og";

import { NextApiHandler } from "next";
import { getLayoutAndConfig } from "../../layouts";
import { z } from "zod";

const imageReq = z.object({
  layoutName: z.string(),
  fileType: z.enum(["svg", "png"]).nullish(),
});

const handler: NextApiHandler = async (req, res) => {
  try {
    const { layoutName, fileType } = await imageReq.parseAsync(req.query);

    const cachedSvg = await getCache(req.query);

    if (cachedSvg) {
      res.statusCode = 200;

      res.setHeader(
        "Content-Type",
        fileType === "svg" ? "image/svg+xml" : `image/${fileType}`,
      );

      res.setHeader(
        "Cache-Control",
        `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
      );

      if (fileType === "png") {
        const png = await renderSVGToPNG(cachedSvg);
        res.end(png);
      } else {
        res.end(cachedSvg);
      }
    }

    const { layout, config } = await getLayoutAndConfig(
      layoutName.toLowerCase(),
      req.query,
    );
    const svg = await renderLayoutToSVG({ layout, config });

    await setCache(req.query, svg);

    res.statusCode = 200;
    res.setHeader(
      "Content-Type",
      fileType === "svg" ? "image/svg+xml" : `image/${fileType}`,
    );
    res.setHeader(
      "Cache-Control",
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );

    if (fileType === "png") {
      const png = await renderSVGToPNG(svg);
      res.end(png);
    } else {
      res.end(svg);
    }
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end(
      `<h1>Internal Error</h1><pre><code>${(e as any).message}</code></pre>`,
    );
    console.error(e);
  }
};

export default handler;
