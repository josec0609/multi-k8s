# Apply 2 tags (latest and SHA) to images for commit being pulled by Travis CI
docker build -t josec0609/multi-client:latest -t josec0609/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t josec0609/multi-server:latest -t josec0609/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t josec0609/multi-worker:latest -t josec0609/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

docker push josec0609/multi-client:latest
docker push josec0609/multi-server:latest
docker push josec0609/multi-worker:latest

docker push josec0609/multi-client:$GIT_SHA
docker push josec0609/multi-server:$GIT_SHA
docker push josec0609/multi-worker:$GIT_SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment client=josec0609/multi-client:$GIT_SHA
kubectl set image deployments/server-deployment server=josec0609/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=josec0609/multi-worker:$GIT_SHA