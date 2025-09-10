# Etapa 1: Build com Node
FROM node:18 AS build

WORKDIR /app

# Copiar apenas os arquivos necessários inicialmente
COPY package*.json ./

# Forçar instalação mesmo com conflitos (como os de TypeScript)
RUN npm install --legacy-peer-deps

# Agora sim copia o restante do projeto
COPY . .

# Build da aplicação Angular
RUN npm run build -- --configuration development

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copia a config do Nginx
COPY nginx.config /etc/nginx/conf.d/default.conf

# Copia os arquivos da build do Angular 
COPY --from=build /app/dist/iris-ged-front /usr/share/nginx/html

# Expor a porta padrão
EXPOSE 80

# Start do Nginx
CMD ["nginx", "-g", "daemon off;"]
