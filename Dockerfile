# --------------------------------------------------------------------------
# STAGE 1: Dependency Installation & Application Build
# This stage installs dependencies, builds the Next.js application,
# and is necessary for compiling the project.
# --------------------------------------------------------------------------
FROM node:20-alpine AS builder

# 1. Set the working directory
WORKDIR /app

# 2. Copy package files first for efficient caching
COPY package.json package-lock.json ./

# 3. Install dependencies
RUN npm install

# 4. Copy the rest of the application source code
COPY . .

# 5. Build the application - Pass all necessary NEXT_PUBLIC variables as ARGS
# IMPORTANT: Next.js variables must be available at BUILD TIME if they are used in config or getStaticProps.
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_PREFIX
ARG NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_PAYHERE_MERCHANT_ID

# Set build arguments as environment variables for the build process
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_PREFIX=$NEXT_PUBLIC_API_PREFIX
ENV NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY=$NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_PAYHERE_MERCHANT_ID=$NEXT_PUBLIC_PAYHERE_MERCHANT_ID

RUN npm run build

# --------------------------------------------------------------------------
# STAGE 2: Production Runtime Image (Lean and Secure)
# This stage only copies the necessary files to run the production app.
# --------------------------------------------------------------------------
FROM node:20-alpine AS runner

# 1. Set the working directory
WORKDIR /app

# 2. Copy build artifacts and Next.js required files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 3. Set the fixed internal container port
# The container will run on port 3000, and Docker Compose handles the dynamic host port mapping.
ENV PORT=3000
EXPOSE 3000

# 4. Define the command to start the production server
CMD ["npm", "run", "start"]
