# CA key and certificate
openssl req -new -x509 -nodes -subj '/CN=Whitelist Registry Controller Webook' -keyout ca.key -out ca.crt
# server key
openssl genrsa -out tls.key 2048
# CSR
openssl req -new -key tls.key -subj '/CN=whitelist-registry.default.svc' -out server.csr
# server certificate
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt
