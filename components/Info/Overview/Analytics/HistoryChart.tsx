import React, { useState } from "react";
import { Bar, Chart } from "react-chartjs-2";
import useSWR from "swr";
import fetcher from "../../../../lib/fetcher";
import { DatasetElement } from "../../../../pages/api/info/trends/chart";
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    BarController,
    LineController,
} from "chart.js";
import { Box, Flex, Select, Skeleton, Stack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
const monthSelection = [1, 3, 6];

ChartJS.register(
    BarController,
    LineController,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip
);
const options = {
    maintainAspectRatio: false,
    // responsive: false

  

    scales: {
        xAxes: {
            stacked: true,
        },

        yAxes: {
            stacked: true,
        },
    },
};
const HistoryChart: React.FC = () => {
    const { data: session } = useSession();
    
    const [months, setMonths] = useState(0.5);
    const { data, error } = useSWR<{
        attendanceGraphData: {
            labels: string[];
            datasets: DatasetElement[];
        };
        start: string;
        end: string;
    }>(`/api/info/trends/chart?months=${months}`, fetcher, {
        revalidateOnFocus: false,
    });
    console.log({ data });

    return (
        <Stack direction="column" w="100%">
            <Flex justifyContent="end">
                <Box>
                    <Select
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                    >
                        <option value={0.5}> 2 weeks </option>
                        {monthSelection.map((month) => (
                            <option key={month} value={month}>
                                {month} {month === 1 ? "month" : "months"}
                            </option>
                        ))}
                    </Select>
                </Box>
            </Flex>
            <Skeleton height="75vh" isLoaded={!!data} w="100%" overflowX="auto">
                <Box w="100%" h="100%" minW="800px">
                    {data && (
                        <Chart
                            width="100%"
                            height="100%"
                            type="bar"
                            options={options}
                            data={data.attendanceGraphData || []}
                        />
                    )}
                </Box>
            </Skeleton>{" "}
        </Stack>
    );
};

export default React.memo(HistoryChart);
