redis_show() {
    echo '$1*' | redis-cli | sed 's/^/get /' | redis-cli 
}

redis_del() {
    redis-cli --scan --pattern "$1" | xargs -L 100 redis-cli DEL
}