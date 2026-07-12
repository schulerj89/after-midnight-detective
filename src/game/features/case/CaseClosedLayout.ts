import { GAME_WIDTH } from '../../constants';

export interface CaseClosedLayout {
  stageWidth: number;
  stageCenterX: number;
  cellWidth: number;
  entranceX: number;
}

export function resolveCaseClosedLayout(viewportWidth: number): CaseClosedLayout {
  const stageWidth = Math.max(GAME_WIDTH, viewportWidth);
  const stageCenterX = stageWidth / 2;
  const cellWidth = Math.min(1_080, Math.max(760, stageWidth * 0.62));
  return {
    stageWidth,
    stageCenterX,
    cellWidth,
    entranceX: stageCenterX - Math.min(240, cellWidth * 0.25),
  };
}
