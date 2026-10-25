import React from 'react';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import styles from './party.module.css';

/**
 * Up to 16 seats on an ellipse around the screen's centre (the board, the
 * drawing, the clock). `badge(id)` adds game status under a seat; `dim(id)`
 * greys out a seat that is out of the game; `highlight(id)` rings the seat
 * whose turn it is.
 */
export default function SeatRing({g, ids, children, badge, dim, highlight, onSeat}) {
  const n = ids.length;
  const small = n > 12;
  return (
    <div className={styles.ring} data-small={small}>
      <div className={styles.ringCenter}>{children}</div>
      {ids.map((id, i) => {
        const p = g.players[id];
        if (!p) return null;
        // Seat 1 at the top, going clockwise.
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + 46 * Math.cos(angle);
        const y = 50 + 42 * Math.sin(angle);
        return (
          <div
            key={id}
            className={styles.ringSeat}
            data-dim={dim ? Boolean(dim(id)) : false}
            data-hot={highlight ? Boolean(highlight(id)) : false}
            data-offline={!p.connected && !p.bot}
            style={{left: `${x}%`, top: `${y}%`}}
            onClick={onSeat ? () => onSeat(id) : undefined}>
            <span className={styles.ringAvatar}>
              <Avatar avatar={p.avatar} color={p.color} size={small ? 'sm' : 'md'} />
              <span className={styles.seatNo}>{p.seat}</span>
            </span>
            <span className={styles.ringName}>{p.name}</span>
            {badge && <span className={styles.ringBadge}>{badge(id)}</span>}
          </div>
        );
      })}
    </div>
  );
}
