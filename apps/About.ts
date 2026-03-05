import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { measureText } from "../lib/canvas/fontAdapter";
import pkg from "../package.json";

const version = pkg.version;
const contributors = [{ username: "gustavlrsn", commits: 74 }];

export const AboutApp: NativeApp = {
  id: "about",
  title: "About This Mockintosh",
  icon: "icon/computer",
  defaultSize: { width: 343, height: 160 },
  scrollable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const sprites: SpriteRegistry = props._sprites;
    ctx.clear(WHITE);

    const computerSprite = sprites?.get("icon/computer");
    if (computerSprite) {
      ctx.blit(computerSprite, 16, 8);
    }

    ctx.drawText("Mockintosh Classic", 56, 8, {
      font: "Geneva9",
      color: BLACK,
    });

    ctx.drawText(`System Version ${version}`, 180, 8, {
      font: "Geneva9",
      color: BLACK,
    });

    ctx.drawText("Contributors", 16, 36, {
      font: "Geneva9",
      color: BLACK,
    });

    ctx.drawHLine(0, 50, ctx.width, BLACK);

    let y = 56;
    for (const contributor of contributors) {
      const userSprite = sprites?.get("user2");
      if (userSprite) {
        ctx.blit(userSprite, 16, y);
      }

      ctx.drawText(`@${contributor.username}`, 36, y, {
        font: "Geneva9",
        color: BLACK,
      });

      const commitsText = `${contributor.commits} commits`;
      const commitsW = measureText(commitsText, "Geneva9");
      ctx.drawText(commitsText, ctx.width - commitsW - 16, y, {
        font: "Geneva9",
        color: BLACK,
      });

      y += 16;
    }
  },
};
