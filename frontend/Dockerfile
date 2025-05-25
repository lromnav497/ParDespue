# Usa una imagen oficial de Node.js para construir la app
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Usa una imagen de nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia el build generado al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuración personalizada de nginx si la tienes (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]