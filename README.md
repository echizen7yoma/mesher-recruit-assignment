# Node version: 17.3.1


# domain, api, common layer
## .env 환경 변수 파일에 정의

### swagger page: http://localhost:3000/api
### 각 엔티티가 저장 되는 시점은 Client call에 의해 이루어진 저장이 아닌, 1분마다 블록 수를 가져와 데이터 베이스의 블록 비교 후 insert.
### 비용 절감을 위해 client(front)에서 call할 때 rpc(infura)로 이루어진 리턴이 아닌 데이터베이스에 저장되어 있는 마지막 block과 rpcLatest block을 비교 후 빈 블록만큼 쿼리 후 데이터 저장
### 시간 별 database count query, state query 등