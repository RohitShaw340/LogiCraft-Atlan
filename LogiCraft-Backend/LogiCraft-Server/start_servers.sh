#!/bin/bash

go build -o main main.go

./main 4001 &
./main 4002 &
./main 4003 &
./main 4004 &

echo "Started 4 instances of the server"