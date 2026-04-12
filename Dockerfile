# --------------------------------------------------------------------------
# STAGE 1: Dependency Installation & Application Build
# --------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

ARG ORG_SLUG
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_PREFIX
ARG NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_PAYHERE_MERCHANT_ID

ENV ORG_SLUG=$ORG_SLUG
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_PREFIX=$NEXT_PUBLIC_API_PREFIX
ENV NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY=$NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_PAYHERE_MERCHANT_ID=$NEXT_PUBLIC_PAYHERE_MERCHANT_ID

RUN npm run build

# --------------------------------------------------------------------------
# STAGE 2: Production Runtime Image
# --------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Pass build args into runtime stage so standalone server has them
ARG ORG_SLUG
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_PREFIX
ARG NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_PAYHERE_MERCHANT_ID

ENV ORG_SLUG=$ORG_SLUG
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_PREFIX=$NEXT_PUBLIC_API_PREFIX
ENV NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY=$NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_PAYHERE_MERCHANT_ID=$NEXT_PUBLIC_PAYHERE_MERCHANT_ID

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]