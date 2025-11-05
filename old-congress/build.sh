echo $(ls)
echo "Build nest app"
echo $(ls)
npm install --production=false
npm run build:server

echo "Build angular app"
cd passover-charity-client/
echo $(ls)
npm install --production=false
npm run build -- --configuration production

echo "move angular dist to server folder"
mv dist ../dist/src/client

