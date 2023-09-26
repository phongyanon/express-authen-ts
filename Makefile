dev:
	docker run -it --rm --name node-authen -p 8000:8000 -v "$(pwd):/app" --network mysql-phpmyadmin node18-authen sh
test:
	echo "test"