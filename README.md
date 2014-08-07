# geonames-import

Imports from geonames.org csv main 'geoname' table to mongodb export format
so it can be imported into mongodb later.
Useful for geocoding and reverse geocoding.
Latest geo dumps: http://download.geonames.org/export/dump/

## Example

```shell
npm install arusanov/geonames-mongo-import -g
cat test/data/cities15000.txt | geonames-import > import.json
mongoimport -h <host> -d <db> -c <collection> -u <user> -p <password> --file import.json
```

## Structure
```js
{
    _id: ObjectId,
    name: string,
    alternatenames: [string],
    loc: {
        type:'Point',
        coordinates:[lon,lat]
    }
    feature_class: string,
    feature_code: string,
    country_code: string,
    population: int,
    timezone: string,
    offset_gmt: int,
    offset_dst: int,
    offset_raw: int
}
```
