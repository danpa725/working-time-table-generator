import pallete from "@styles/utils/pallete";
import { Check, Confetti, Settings, Trash } from "tabler-icons-react";

import { useEffect, useState } from "react";

import { Button, Modal, NumberInput, Popover, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useLocalStorage } from "@mantine/hooks";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";

import { WORK_INFO } from "@constants/workInfo";
import { WORK_INFO_ARRAY_KEY } from "@constants/localStorageKey";

import {
    addDayToString,
    getWorkCycleInfo,
    isHolliday,
    WorkInfoType,
} from "@core/work-gen";

import { Box } from "@components/atoms";
import WorkSheet from "@components/work-sheet";

interface SlectDateProps {
    agentList: string[];
}

const validateDate = (date: dayjs.Dayjs) =>
    isHolliday(date) ? dayjs(addDayToString(date, 2)) : date;

const getNextDay = (dayJsObject: dayjs.Dayjs, dayMount: number = 1): dayjs.Dayjs =>
    dayjs(addDayToString(dayjs(dayJsObject), dayMount));

function WorkInfoEditor({ agentList }: SlectDateProps) {
    const [workInfoArray, setWorkInfoArray] = useLocalStorage<
        WorkInfoType<string>[]
    >({
        key: WORK_INFO_ARRAY_KEY,
        defaultValue: [],
    });
    const workInfoArrayLength = workInfoArray?.length;
    const isWorkNull = workInfoArrayLength === 0;

    const [openCalendar, setOpenCalander] = useState(false);
    const [openeReset, setOpenReset] = useState(false);

    const [cycle, setCycle] = useState(1);
    const [workStartDate, setWorkStartDate] = useState<dayjs.Dayjs | null>(
        isWorkNull
            ? dayjs()
            : getNextDay(workInfoArray[workInfoArrayLength - 1]?.dayJsObject)
    );

    useEffect(() => {
        setWorkStartDate(
            isWorkNull
                ? dayjs()
                : getNextDay(workInfoArray[workInfoArrayLength - 1]?.dayJsObject)
        );
    }, [workInfoArray]);

    return (
        <>
            <Box display="flex" flexDirection="column" align="center" gap="2.25rem">
                <Box
                    display="flex"
                    flexDirection="row"
                    align="center"
                    gap="1rem"
                    mt={30}
                >
                    <Button
                        variant="outline"
                        color="teal"
                        size="xs"
                        onClick={() => setOpenCalander(true)}
                        rightIcon={<Check color="teal" size={14} />}
                    >
                        {workInfoArrayLength !== 0
                            ? "????????? ????????? ?????? ????????? ?????? ?????? ?????????"
                            : "????????? ?????? ?????? ?????????"}
                    </Button>
                    {workInfoArrayLength !== 0 && (
                        <Popover
                            opened={openeReset}
                            onClose={() => setOpenReset(false)}
                            target={
                                <Button
                                    variant="outline"
                                    color="red"
                                    size="xs"
                                    onClick={() => setOpenReset(true)}
                                    rightIcon={<Trash color="red" size={14} />}
                                >
                                    ?????? ?????? ????????????
                                </Button>
                            }
                            width={210}
                            position="bottom"
                            withArrow
                        >
                            <Box
                                display="flex"
                                flexDirection="column"
                                align="center"
                                justify="center"
                                width="100%"
                                gap="1rem"
                            >
                                <Text color="red" weight="bolder" size="xs">
                                    ????????? ????????? ????????? ????????? ?????????
                                </Text>
                                <Button
                                    variant="filled"
                                    color="red"
                                    size="xs"
                                    onClick={() => {
                                        setWorkInfoArray([]);
                                        setOpenReset(false);
                                    }}
                                    rightIcon={<Trash color="white" size={14} />}
                                >
                                    ???????????? ??????
                                </Button>
                            </Box>
                        </Popover>
                    )}
                </Box>

                <WorkSheet
                    workInfoArray={workInfoArray}
                    setWorkInfoArray={setWorkInfoArray}
                />
            </Box>

            <Modal
                opened={openCalendar}
                onClose={() => setOpenCalander(false)}
                centered
                overlayOpacity={0.5}
                overlayColor={pallete.gray3}
                withCloseButton={false}
                padding="lg"
                size={400}
                title={<Settings size={20} />}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    align="center"
                    justify="center"
                    gap="2.75rem"
                    width="100%"
                    minHeight={100}
                    pb={30}
                >
                    <DatePicker
                        placeholder="???????????? ?????? ??????"
                        label="?????? ?????????"
                        locale="ko"
                        value={workStartDate && new Date(workStartDate?.format())}
                        onChange={(date) => {
                            setWorkStartDate(validateDate(dayjs(date)!));
                        }}
                        firstDayOfWeek="sunday"
                        dayStyle={(date, modifiers) => {
                            if (modifiers.selected) {
                                return {
                                    background: pallete.teal7,
                                    border: `2px solid ${pallete.teal3}`,
                                    pointerEvents: "none",
                                };
                            }
                            return {};
                        }}
                        required
                    />
                    <NumberInput
                        defaultValue={1}
                        placeholder="???????????? ??????"
                        label="????????? ?????? ?????????"
                        required
                        value={cycle}
                        onChange={(cycle) => setCycle(cycle!)}
                        min={1}
                    />

                    <Button
                        variant="filled"
                        color="teal"
                        rightIcon={<Confetti size={18} />}
                        onClick={() => {
                            setWorkInfoArray(
                                getWorkCycleInfo({
                                    startDate: workStartDate!,
                                    workPerDay: WORK_INFO.WORK_PER_DAY,
                                    workerList: agentList,
                                    cycle: cycle,
                                })
                            );
                            setOpenCalander(false);
                        }}
                    >
                        ????????? ???????????? ??????
                    </Button>
                </Box>
            </Modal>
        </>
    );
}

export default WorkInfoEditor;
