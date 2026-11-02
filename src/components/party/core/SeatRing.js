import React from 'react';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import styles from './party.module.css';

/**
 * The table on the big screen: the game's centre (the board, the drawing,
 * the clock) on top, then every player as a rectangular tile in seat order,
 * left to right, so neighbours stay next to each other. Up to 64 tiles; they
 * shrink as the table fills. `badge(id)` adds game status to a tile; `dim(id)`
 * greys out a player who is out of the game; `highlight(id)` marks the tile
 * whose turn it is.
 */
export default function SeatRing({g, ids, children, badge, dim, highlight, onSeat}) {
  const n = ids.length;
  const density = n > 40 ? 'tiny' : n > 24 ? 'dense' : n > 12 ? 'small' : 'normal';
  return (
    <div className={styles.table} data-density={density}>
      <div className={styles.tableCenter}>{children}</div>
      <div className={styles.tableSeats}>
        {ids.map((id) => {
          const p = g.players[id];
          if (!p) return null;
          return (
            <div
              key={id}
              className={styles.tableSeat}
              data-dim={dim ? Boolean(dim(id)) : false}
              data-hot={highlight ? Boolean(highlight(id)) : false}
              data-offline={!p.connected && !p.bot}
              onClick={onSeat ? () => onSeat(id) : undefined}>
              <span className={styles.ringAvatar}>
                <Avatar avatar={p.avatar} color={p.color} size={density === 'normal' ? 'md' : density === 'small' ? 'sm' : 'xs'} />
              </span>
              <span className={styles.tableInfo}>
                <span className={styles.ringName}>
                  <span className={styles.seatNo}>{p.seat}</span> {p.name}
                </span>
                {badge && <span className={styles.ringBadge}>{badge(id)}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
