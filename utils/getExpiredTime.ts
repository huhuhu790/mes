const EXPIRED_DAYS = Number(process.env.EXPIRED_DAYS);
const EXPIRED_HOURS = Number(process.env.EXPIRED_HOURS);
const EXPIRED_MINUTES = Number(process.env.EXPIRED_MINUTES);
const EXPIRED_SECONDS = Number(process.env.EXPIRED_SECONDS);
export const EXPIRED_TIME = EXPIRED_DAYS * 24 * 60 * 60 + EXPIRED_HOURS * 60 * 60 + EXPIRED_MINUTES * 60 + EXPIRED_SECONDS;