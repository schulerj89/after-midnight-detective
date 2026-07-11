# Guided altered-loop observation QA

## Director finding

The deduction-critical movement read as ambient NPC motion: the player waited, Miles
crossed the room without setup, and the evidence was recorded at departure. The
restaging now behaves like a directed live observation rather than a cutscene.

## Player-facing sequence

1. Fade and instantly reset Miles at the north windows.
2. Establish his claimed post at 12:08.
3. Announce that he leaves it and reveal the office route.
4. Follow him through the center aisle in two controlled travel legs.
5. Hold on his arrival at the manager office.
6. Record `MILES CHECKED THE OFFICE` only after that arrival hold.
7. Restore player control after the confirmation card.

The mobile joystick and action buttons are hidden during the focused sequence. A
48 px `END RESTAGING` target remains available and requires confirmation until the
observation has been recorded. Reduced-motion mode uses stationary tableaux.

## Named captures

- `altered-loop-anticipate-mobile.png`: departure is explicitly announced.
- `altered-loop-route-mobile.png`: Miles, the route, destination, and subject-follow
  framing are simultaneously legible.
- `altered-loop-recorded-reduced-motion-mobile.png`: arrival precedes the evidence
  confirmation and the control changes to `RETURN TO CASE`.

## Programmatic assertions

- The phase model is deterministic: reset, establish, anticipate, two transit legs,
  arrived, recorded, released.
- Neither transit phase records evidence.
- The recording phase is entered only after the 1.3 second arrival hold.
- The browser exposes the active phase, actor mark, input lock, reduced-motion state,
  and observation-recorded state on the game canvas.
- Browser input-lock regression: while the anticipation pose was active, keyboard
  `N`, `T`, and `E` plus a canvas tap left the case board closed and dialogue closed.
- `RETURN TO CASE` ends the restaging, restores controls, and opens the case board
  directly on the timeline containing `Miles checks the manager office`.
