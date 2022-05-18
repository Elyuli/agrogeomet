import React, { useEffect, useState } from "react";
import axios from "axios";
import Map from "../components/Map/Map";
import * as ol from "ol";
import TileLayer from "ol/layer/Tile";
import { BingMapProvider } from "../context/BingMapContext";

import {
	Controls,
	FullScreenControl,
	MousePositionControl,
} from "../controls/index";
import Header from "../components/Header/Header";
import SideBarLeft from "../components/Aside/SideBarLeft";
import { ApiProvider } from "../context/ApiContext";
import Loader from "../components/Loader/Loader";
import BingMap from "../components/Map/BingMap";
import Layers from "../components/ListLayers/Layers";
import TileLayerComp from "../components/ListLayers/TileLayerComp";
import Navigate from "../components/Navigate/Navigate";
import TableInfo from "../components/Table/TableInfo";
import useTour from "../hooks/useTour";

const STEPS = [
	{
		content: (
			<div>
				Bienvenido a la Ayuda!
				<br />
				<h3>Like this H3 title</h3>
			</div>
		),
		placement: "center",
		target: '[data-tut="reactour_help"]',
		locale: {
			skip: <strong aria-label="skip">Dejar</strong>,
			next: <strong aria-label="next">Próximo</strong>,
			back: <strong aria-label="back">Atrás</strong>,
		},
		styles: {
			buttonNext: { backgroundColor: "#222" },
		},
	},
	{
		content: (
			<div>
				You can render anything!
				<br />
				<h3>Like this H3 title</h3>
			</div>
		),
		placement: "bottom",
		target: '[data-tut="reactour_toolbar"]',
		title: "Our Mission",
		floaterProps: {
			disableAnimation: true,
		},
	},
	{
		content: "These are our super awesome projects!",
		locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
		placement: "bottom",
		target: '[data-tut="reactour_help"]',
		/* floaterProps: {
			disableAnimation: true,
		}, */
	},
	{
		content: "These are our super awesome projects!",
		placement: "bottom",
		floaterProps: {
			disableAnimation: true,
		},
		styles: {
			options: {
				width: 300,
			},
		},
		target: '[data-tut="reactour_info"]',
		title: "Our projects",
	},
];

const Home = () => {
	const [map, setMap] = useState(new ol.Map());
	const [isBtnApiActive, setIsBtnApiActive] = useState(false);
	const [loading, setLoading] = useState(false);
	const [checkboxes, setCheckboxes] = useState([]);
	const [nameLayerHome, setNameLayerHome] = useState("");
	const [nameWorkHome, setNameWorkHome] = useState("");
	const [showLayer, setShowLayer] = useState(false);
	const [checkObjectHome, setCheckObjectHome] = useState({});
	const [listLayersActiveHome, setListLayersActiveHome] = useState(false);
	const [isActiveInfoHome, setIsActiveInfoHome] = useState(false);
	const [isActiveTable, setIsActiveTable] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [refMap, setRefMap] = useState(null);
	const [nameLayersHome, setNameLayersHome] = useState([]);
	const [wmsLayer, setWmsLayer] = useState([]);
	const [tableWidth, setTableWidth] = useState(0);
	const [propTransform, setPropTransform] = useState(0);
	const [run, setRun] = useState(false);
	const tour = useTour(STEPS, "LS_KEY", run);

	/* useEffect(() => {
		setTableData(tableData);
		console.log("tableData", tableData);
	}, [tableData]); */

	const handlOnChangeCheckLayer = (checks) => {
		//console.log("checks", checks);
		setCheckboxes(checks);
		//console.log("checkboxes`]", checkboxes);
	};

	const handlOnClickGetInfoTileLayer = async (e, mapRef) => {
		if (e.target.tagName !== "CANVAS") return;
		if (!isActiveInfoHome) return;

		setRefMap(mapRef);
		setLoading(true);

		const view = map.getView();
		const viewResolution = view.getResolution();
		const viewProjection = view.getProjection();
		const coord = map.getEventCoordinate(e);
		//console.log("e>>>>>>>>>>>>>>", e);
		//console.log("view>>>>>>>>>>>>>>", view);
		//console.log("viewResolution>>>>>>>>>>>>>>", //viewResolution);
		//console.log("viewProjection>>>>>>>>>>>>>", viewProjection);
		//console.log("coord>>>>>>>>>>>>>>", map.getEventCoordinate(e));
		//console.log("evt.pixel>>>>>>>>>>>>>>", map.getEventPixel(e));
		const sourcesWMS = map
			.getLayers()
			.getArray()
			.map((layer) => layer.getSource());
		//console.log("sources>>>>>>>>>>>>>", sourcesWMS);
		const nameLayers = [];
		//const { layers } = sourcesWMS.map((layer) => layer.getParams());

		const promises = [];

		for (let i = 1; i < sourcesWMS.length; i++) {
			let { LAYERS } = sourcesWMS[i].getParams();
			nameLayers.push(LAYERS);

			if (nameLayers.length === 0) {
				setLoading(false);
				return;
			}

			setNameLayersHome([...nameLayers]);
			//console.log("nameLayers>>>>>>>>>>>>>", nameLayers);

			const url = sourcesWMS[i].getFeatureInfoUrl(
				coord,
				viewResolution,
				viewProjection,
				{
					QUERY_LAYERS: LAYERS,
					layers: LAYERS,
					INFO_FORMAT: "application/json",
					FEATURE_COUNT: 50,
				}
			);
			console.log("url>>>>>>>>>>>>>>", url);
			//console.log("source.join>>>>>>>>>", nameLayers.join(","));

			let result = {};
			if (url) {
				mapRef.classList.add("sidebar-bottom-open");
				setIsActiveTable(true);

				result = axios.get(url);
				promises.push(result);
				//promises.push({ LAYERS: result });
			} else {
				setTableData({ ...tableData, [LAYERS]: [] });
			}
		}
		//console.log("promises", promises);

		const results = await Promise.all(promises);
		//console.log("results", results);

		const aux = [];
		nameLayers.map((name, i) => {
			aux.push({ [name]: results[i].data.features });
		});
		setTableData([...aux]);
		setLoading(false);
		//setTableData({ ...tableData });
	};

	const handlOnClickCloseTable = () => {
		setIsActiveTable(false);
		refMap.classList.remove("sidebar-bottom-open");
	};

	useEffect(() => {
		setCheckboxes(checkboxes);
		setIsActiveInfoHome(isActiveInfoHome);
		/* console.log("nameWorkHome", nameWorkHome);
		console.log("listLayersActiveHome", listLayersActiveHome);
		console.log("checkboxes>>>", checkboxes);
		console.log("checkboxes.length", checkboxes.length);
		console.log("checkboxes[nameWorkHome]", checkboxes[nameWorkHome]); */
	}, [
		nameWorkHome,
		listLayersActiveHome,
		checkboxes,
		isActiveInfoHome,
		tableData,
	]);

	return (
		<ApiProvider
			isBtnApiActive={isBtnApiActive}
			setIsBtnApiActive={setIsBtnApiActive}
			loading={loading}
			setLoading={setLoading}
			setNameLayerHome={setNameLayerHome}
			setNameWorkHome={setNameWorkHome}
			setCheckObjectHome={setCheckObjectHome}
			setListLayersActiveHome={setListLayersActiveHome}
			setCheckboxes={setCheckboxes}
			setIsActiveInfoHome={setIsActiveInfoHome}
		>
			{tour}
			<Navigate setRun={setRun} run={run} />
			<BingMapProvider>
				<Map
					map={map}
					setMap={setMap}
					handlOnClickGetInfoTileLayer={handlOnClickGetInfoTileLayer}
				>
					{isBtnApiActive ? (
						<SideBarLeft
							isBtnApiActive={isBtnApiActive}
							setIsBtnApiActive={setIsBtnApiActive}
							handlOnChangeCheckLayer={handlOnChangeCheckLayer}
						/>
					) : (
						<Header setIsBtnApiActive={setIsBtnApiActive} />
					)}
					<Controls>
						<FullScreenControl />
						<MousePositionControl />
					</Controls>
					<BingMap />
					<Layers>
						{nameWorkHome &&
							listLayersActiveHome &&
							checkboxes &&
							checkboxes[nameWorkHome].map(({ name, checked }, i) => {
								//console.log("checkbox>>>", checked);

								return checked ? (
									<TileLayerComp
										key={i}
										map={map}
										setMap={setMap}
										checkbox={checked}
										wmsLayer={wmsLayer}
										setWmsLayer={setWmsLayer}
										setLoading={setLoading}
									/>
								) : (
									map
										.getLayers()
										.getArray()
										.forEach((layer) => {
											if (
												layer.get("name") &&
												layer.get("name") === `${nameWorkHome}:${name}`
											) {
												layer.getSource().clear();
												map.removeLayer(layer);
												setMap(map);
											}
										})
								);
							})}
					</Layers>
					{loading && <Loader />}
				</Map>
				{isActiveTable && (
					<TableInfo
						isBtnApiActive={isBtnApiActive}
						handlOnClickCloseTable={handlOnClickCloseTable}
						tableData={tableData}
						setTableData={setTableData}
						nameLayersHome={nameLayersHome}
						loading={loading}
						isActiveTable={isActiveTable}
						setTableWidth={setTableWidth}
						tableWidth={tableWidth}
						setPropTransform={setPropTransform}
						propTransform={propTransform}
					/>
				)}
			</BingMapProvider>
		</ApiProvider>
	);
};

export default Home;
