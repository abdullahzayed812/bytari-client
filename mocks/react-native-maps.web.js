import React from 'react';
import { View } from 'react-native';

const MapView = ({ children, style }) => React.createElement(View, { style }, children);
MapView.Animated = MapView;

const Marker = () => null;
const Callout = () => null;
const Circle = () => null;
const Polygon = () => null;
const Polyline = () => null;

const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = null;

export { Marker, Callout, Circle, Polygon, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT };
export default MapView;
