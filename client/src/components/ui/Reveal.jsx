import { motion } from "framer-motion";

/* The one scroll-reveal shape used across the whole reference: fade up on
   viewport enter, once, on the house curve. `y` and `duration` are retimed
   per section exactly as measured — see design-audit.md §2.

     committee .55s / 22px    speakers .6s / 24px    partners .6s / 22px
     tickets   .7s  / 30px    agenda   .8s / 20px  (expo curve)

   Cards stagger by index; the reference does it with inline animation-delay,
   we do the same thing through `delay`. */
export default function Reveal({
  children,
  y = 24,
  duration = 0.6,
  delay = 0,
  ease = [0.22, 1, 0.36, 1],
  as = "div",
  amount = 0.15,
  className,
  style,
  ...rest
}) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease }}
      {...rest}
    >
      {children}
    </M>
  );
}

/* Stagger helper for grids — keeps the per-card delay maths in one place.
   The reference uses ~55-70ms steps and caps the ramp so long grids don't
   end up with a two-second tail. */
export const stagger = (i, step = 0.06, cap = 8) => Math.min(i, cap) * step;
