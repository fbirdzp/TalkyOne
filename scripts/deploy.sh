#!/bin/bash

# TalkyOne 部署脚本
# 使用方法: ./scripts/deploy.sh [test|staging|prod]

set -e

ENV=${1:-test}
PROJECT_NAME="talkyone"
DOCKER_COMPOSE_FILE="docker/docker-compose.yml"

echo "🚀 开始部署 TalkyOne 到 $ENV 环境..."

# 检查环境参数
if [[ ! "$ENV" =~ ^(test|staging|prod)$ ]]; then
  echo "❌ 错误: 环境参数必须是 test, staging 或 prod"
  echo "使用方法: $0 [test|staging|prod]"
  exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin $(git branch --show-current)

# 构建 Docker 镜像
echo "🏗️  构建 Docker 镜像..."
docker build -t $PROJECT_NAME:$ENV -f docker/Dockerfile .

# 根据环境选择 docker-compose 文件
if [ "$ENV" = "prod" ]; then
  COMPOSE_FILES="-f $DOCKER_COMPOSE_FILE -f docker/docker-compose.prod.yml"
else
  COMPOSE_FILES="-f $DOCKER_COMPOSE_FILE"
fi

# 停止并移除旧容器
echo "🛑 停止旧容器..."
docker-compose $COMPOSE_FILES down

# 启动新容器
echo "🚀 启动新容器..."
docker-compose $COMPOSE_FILES up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务健康状态
echo "🔍 检查服务健康状态..."
if curl -f http://localhost:3000/api/health; then
  echo "✅ 部署成功！服务运行正常"
else
  echo "❌ 部署失败！服务健康检查未通过"
  exit 1
fi

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost:3000"
