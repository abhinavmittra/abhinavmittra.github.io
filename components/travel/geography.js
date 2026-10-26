import { geoArea, geoEquirectangular, geoPath, geoContains } from 'd3-geo';

export const globePalette = { ocean:'#232a30', land:'#59635c', border:'#303a34', visited:'#b5bce8', selected:'#fff0b8' };
export function geographicFeatures(records) {
  return records.map(record=>{
    // Normalize each ring independently: dateline islands can have mixed winding.
    const coordinates=record.polygons.map(p=>p.map((ring,index)=>{
      const closed=[...ring,ring[0]];
      const small=geoArea({type:'Polygon',coordinates:[closed]})<2*Math.PI;
      return small===(index===0)?closed:closed.slice().reverse();
    }));
    const geometry={type:'MultiPolygon',coordinates};
    return {type:'Feature',properties:{code:record.code,name:record.name},geometry};
  });
}
export function countryColor(code,selected,visits) {
  if(code===selected)return globePalette.selected;
  const index=visits.findIndex(c=>c.code===code);
  return index<0?globePalette.land:globePalette.visited;
}
export function mapProjection(width,height) {return geoEquirectangular().scale(width/(2*Math.PI)).translate([width/2,height/2]);}
export function mapPaths(features,width,height) {
  const path=geoPath(mapProjection(width,height));
  return features.map(feature=>({code:feature.properties.code,d:path(feature)||''}));
}
export function visitedAt(features,visits,point) {
  if(!point)return null;
  const match=features.find(f=>visits.some(c=>c.code===f.properties.code)&&geoContains(f,point));
  return match?.properties.code||null;
}
export function globeVector(longitude,latitude,radius=1) {
  const lon=longitude*Math.PI/180,lat=latitude*Math.PI/180;
  return [radius*Math.cos(lat)*Math.cos(lon),radius*Math.sin(lat),-radius*Math.cos(lat)*Math.sin(lon)];
}
