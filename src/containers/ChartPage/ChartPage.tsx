import { useAuthStore } from "../../stores/authStore";
import "./ChartPage.css";
import { PieChart } from '@mui/x-charts/PieChart';
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading/Loading";

const ChartPage = () => {
	const token = useAuthStore((state) => state.token);
	const [response, setResponse] = useState();
	const [genres, setGenres] = useState([]);

	useEffect(() => {
		async function getTop() {
			const response = await invoke<string>("get_user_top_items", {
			  accessToken: token, 
			});
			const top = JSON.parse(response);
			const allGenres = top.items.map(item => item.genres)
			var genres = countRepetitions(allGenres.flat())
			const topItems = Array.from(genres.entries()).sort((a, b) => b[1] - a[1]);
			setResponse(top)

			let graphData = Array.from(topItems.entries()).map(([label, value], index) => ({
				id: index,
				label: value[0],
				value: value[1],
			}));
			graphData = graphData.slice(0, 10)
			console.log(graphData);
			setGenres(graphData)
		}

		function countRepetitions(arr) {
			const countMap = new Map();

			for (const item of arr) {
			countMap.set(item, (countMap.get(item) || 0) + 1);
			}

			return countMap;
		}

		getTop()

	}, [])

	const pieParams = {
		height: 200,
		width: 400,
		margin: { right: 5 },
		slotProps: { legend: { hidden: true } },
	};

	return (
		<div className="chart-page">
			{
				genres.length != 0 ? (
					<PieChart
						series={[
							{
							  data: genres,
							  highlightScope: { fade: 'global', highlight: 'item' },
							  // faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
							  // valueFormatter,
							},
						]}
						{...pieParams}
					/>
				) : <Loading />
			}
		</div>
	)
}

export default ChartPage;
