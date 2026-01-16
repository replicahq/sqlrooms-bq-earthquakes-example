import {
  Table,
  vectorFromArray,
  FixedSizeList,
  Float64,
  Field,
} from 'apache-arrow';

/**
 * Constructs a GeoArrow-compatible Table from individual Arrow vectors.
 */
export function buildGeoArrowPointTable(
  latVector: any,
  lonVector: any,
  magVector: any,
  depthVector: any,
  dateVector: any,
) {
  const lats = latVector.toArray();
  const lons = lonVector.toArray();
  const mags = magVector.toArray();
  const depths = depthVector.toArray();
  const dates = dateVector.toArray();

  const rowCount = lats.length;

  const points = new Array(rowCount);
  for (let i = 0; i < rowCount; i++) {
    points[i] = [lons[i], lats[i]];
  }

  const childField = new Field('xy', new Float64());
  const geomType = new FixedSizeList(2, childField);
  const geomCol = vectorFromArray(points, geomType);

  const magCol = vectorFromArray(mags);
  const depthCol = vectorFromArray(depths);
  const dateCol = vectorFromArray(dates);

  return new Table({
    magnitude: magCol,
    depth: depthCol,
    datetime: dateCol,
    geom: geomCol,
  });
}
