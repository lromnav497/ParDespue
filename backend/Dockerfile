# Usa una imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto (ajusta si usas otro)
EXPOSE 3000

# Variable de entorno para producción (opcional)
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["node", "server.js"]