import { Box, Breadcrumbs, Button, IconButton, makeStyles, Paper, Tab, Typography, useTheme } from "@material-ui/core"
import { LamassuModalPolyphormic } from "components/Modal"
import {  useState } from "react";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useHistory } from "react-router";
import { LamassuChip } from "components/LamassuChip";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import EmptyOverlayGrid from "components/DataGridCustomComponents/EmptyOverlayGrid"

import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import moment from "moment";

import TimerOffIcon from '@material-ui/icons/TimerOff';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import PublishIcon from '@material-ui/icons/Publish';
import RouterOutlinedIcon from '@material-ui/icons/RouterOutlined';
import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const useStyles = makeStyles((theme) => ({
    scroll: {
        '&::-webkit-scrollbar': {
            width: "5px",
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.scrollbar,
            borderRadius: 20,
        }
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "1fr",
        height: "100%"
    },
    content:{
        gridRow: 1,
        gridColumn: "1/4",

    },
    contentCollapsed:{
        gridRow: 1,
        gridColumn: "1/3",

    },
    rightSidebar: {
        gridRow: 1,
        gridColumn: 3,
    },
    cell:{
        "& .MuiDataGrid-cell": {
            outline: "none!important",
            cursor: "pointer"
        }
    } 
}))

const DeviceInspect = ({id, deviceData, caList, provisionDevice, deleteDevice, revokeDeviceCert}) => {
    let history = useHistory();
    const theme = useTheme();

    const classes = useStyles();
    const [modalInfo, setModalInfo] = useState({open: false, type: null})
    const [activeTab, setActiveTab] = useState("0")

    const resetModal = () =>{
        setModalInfo({
            open: false,
            type: null,
        })
    }

    const onProvisionDeviceClick = () =>{
        setModalInfo({
            open: true,
            type: "deviceProvision",
            caList: caList,
            device: deviceData,
            dmsCrt: "",
            handleSubmit: (deviceId, caName, dmsProvisionUrl)=>{provisionDevice(deviceId, caName, dmsProvisionUrl); resetModal()},
        })
    }
    const onDeleteDeviceClick = () =>{
        setModalInfo({
            open: true,
            type: "deviceDelete",
            deviceId: deviceData.id,
            deviceName: deviceData.alias,
            handleSubmit: ()=>{deleteDevice(id); resetModal(); /*history.push("/dms/devices")*/},
        })
    }

    const onRevokeDeviceCertClick = () =>{
        setModalInfo({
            open: true,
            type: "deviceCertRevocation",
            deviceId: deviceData.id,
            deviceName: deviceData.alias,
            handleSubmit: ()=>{revokeDeviceCert(id); resetModal();},
        })
    }


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const green = {
        bg: theme.palette.type == "light" ? "#D0F9DB" : "#4a6952",
        txt: theme.palette.type == "light" ? "green" : "#25ee32"
    }
    const orange = {
        bg: theme.palette.type == "light" ? "#FFE9C4" : "#635d55",
        txt: "orange"
    }
    const red = {
        bg: theme.palette.type == "light" ? "#FFB1AA" : "#6d504e",
        txt: "red"
    }
    const unknownColor = {
        bg: theme.palette.type == "light" ? "#FFB1AA" : "#6d504e",
        txt: "red"
    }
    
    var gridData = []
    if(deviceData && deviceData.certHistory){
        deviceData.certHistory.forEach(histo => {
            gridData.push({
                ...histo, 
                id: histo.serial_number,
                valid_from: moment(histo.valid_from),
                valid_to: moment(histo.valid_to)
            })
        });
    }
    const columns = [
        { field: 'id', headerName: 'Serial Number', width: 400 },
        { field: 'issuer_name', headerName: 'CA Name', width: 350 },
        //{ field: 'valid_from', headerName: 'Valid from', width: 350 },
        //{ field: 'valid_to', headerName: 'Valid Until', width: 350 },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 150,
            renderCell: (params) => {
                if (params.value == "REVOKED"){
                    return <LamassuChip label={params.value} status={"red"} rounded={false} />
                } else {    // sttatus == issued
                    return <LamassuChip label={params.value} status={"green"} rounded={false} />
                }
            }
        },    
    ]


    var strengthElement = (strengthString) => {
        var txt = "Unknown"
        var color = "unknown"
        if (strengthString == "low"){
          txt = "Low"
          color = "red"
        }else if (strengthString == "medium"){
          txt = "Medium"
          color = "orange"
        }else if (strengthString == "high"){
          txt = "High"
          color = "green"
        }  
        return (
          <LamassuChip label={txt} status={color} rounded={false}/>
      )}
    
    var statusElement = (status) => {
        var color = "unknown"
        if (status === "PENDING_PROVISION" || status == "CERT_EXPIRED"){
          color = "orange"
        }else if (status == "DEVICE_PROVISIONED"){
          color = "green"
        }else if (status == "CERT_REVOKED" || status == "DEVICE_DECOMMISIONED"){
          color = "red"
        } else{
            color = "unknown"
        }
        return (
          <LamassuChip label={status} status={color} rounded={false}/>
      )}
    

    return(
        <>
            <Box className={classes.grid}>
                <Box className={classes.content} style={{padding: 20}}>
                    <Box style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                            <Typography onClick={()=>{history.push("/")}} style={{cursor: "pointer"}}> Home </Typography>  
                            <Typography onClick={()=>{history.push("/dms/list")}} style={{cursor: "pointer"}}> DMSs </Typography>  
                            <Typography onClick={()=>{history.push("/dms/devices")}} style={{cursor: "pointer"}}> Devices </Typography>  
                            <Typography color="textPrimary">Device</Typography>
                        </Breadcrumbs>
                    </Box>

                    {
                        deviceData !== undefined ? (
                            <>
                                <Box component={Paper} style={{marginTop: 20, padding: 20, display: "flex", justifyContent: "space-between"}}>
                                    <Box style={{display: "flex"}}>
                                        <Box style={{minWidth: 500}}>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Device Alias</Typography>
                                                <Typography>{deviceData.alias}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Device UUID</Typography>
                                                <Typography>{deviceData.id}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>DMS ID</Typography>
                                                <Typography>{deviceData.dms_id}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Status</Typography>
                                                {statusElement(deviceData.status)}
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Key Type</Typography>
                                                <Typography>{deviceData.key_type}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Key Bits</Typography>
                                                <Typography>{deviceData.key_bits}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Key Strength</Typography>
                                                {strengthElement(deviceData.key_strength)}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Country</Typography>
                                                <Typography>{deviceData.country}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>State</Typography>
                                                <Typography>{deviceData.state}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Locality</Typography>
                                                <Typography>{deviceData.locality}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Organization</Typography>
                                                <Typography>{deviceData.organization}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Organization Unit</Typography>
                                                <Typography>{deviceData.organization_unit}</Typography>
                                            </Box>
                                            <Box style={{display: "flex", marginBottom: 5}}>
                                                <Typography variant="button" style={{minWidth: 150}}>Common Name</Typography>
                                                <Typography>{deviceData.common_name}</Typography>
                                            </Box>
                                        </Box>
                                     
                                    </Box>
                                    <Box style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                        <Button variant="contained" color="primary" onClick={()=>{onProvisionDeviceClick()}}>Provision Device</Button>
                                        <Button variant="contained" color="primary" onClick={()=>{onRevokeDeviceCertClick()}} style={{marginTop: 10}}>Revoke current certificate</Button>
                                        <Button variant="contained" color="primary" onClick={()=>{onDeleteDeviceClick()}} style={{marginTop: 10}}>Delete Device</Button>
                                    </Box>
                                </Box>
                                <Box component={Paper} style={{marginTop: 20}}>
                                    <TabContext value={activeTab}>
                                        <TabList style={{background: theme.palette.certInspector.tabs}} variant="fullWidth" value={activeTab} onChange={handleTabChange} aria-label="simple tabs example">
                                            <Tab value="0" label="Logs" />
                                            <Tab value="1" label="Last emitted cert"/>
                                            <Tab value="2" label="Emitted certs history"/>
                                        </TabList>
                                        <TabPanel className={classes.scroll} value="0" style={{padding: 20, overflowY: "auto", height: "50vh"}}>
                                            {
                                                deviceData.logs ? (
                                                    <Timeline>
                                                        {
                                                            deviceData.logs.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp) }).map((log, index)=>(
                                                                <TimelineItem>
                                                                    <TimelineOppositeContent style={{maxWidth: 200}}>
                                                                        <Typography variant="body2" color="textSecondary">
                                                                            {moment(log.timestamp).format("MMMM D YYYY, HH:mm:ss Z").toString()}
                                                                        </Typography>
                                                                    </TimelineOppositeContent>
                                                                    <TimelineSeparator>
                                                                    {
                                                                        log.log_type == "LOG_DEVICE_CREATED" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: green.bg}}>
                                                                                    <RouterOutlinedIcon style={{ color: green.txt}}/>
                                                                                </TimelineDot>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        log.log_type == "LOG_PENDING_PROVISION" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: orange.bg}}>
                                                                                    <LayersOutlinedIcon style={{ color: orange.txt}}/>
                                                                                </TimelineDot>
                                                                                <TimelineConnector style={{background: orange.txt}}/>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        log.log_type == "LOG_CERT_EXPIRED" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: orange.bg}}>
                                                                                    <TimerOffIcon style={{ color: orange.txt}}/>
                                                                                </TimelineDot>
                                                                                <TimelineConnector style={{background: orange.txt}}/>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        log.log_type == "LOG_CERT_REVOKED" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: red.bg}}>
                                                                                    <DeleteIcon style={{ color: red.txt}}/>
                                                                                </TimelineDot>
                                                                                <TimelineConnector style={{background: red.txt}}/>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        log.log_type == "LOG_PROVISIONED" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: green.bg}}>
                                                                                    <PublishIcon style={{ color: green.txt}}/>
                                                                                </TimelineDot>
                                                                                <TimelineConnector style={{background: green.txt}}/>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        log.log_type == "LOG_DEVICE_DECOMMISIONED" && (
                                                                            <>  
                                                                                <TimelineDot style={{background: red.bg}}>
                                                                                    <HighlightOffIcon style={{ color: red.txt}}/>
                                                                                </TimelineDot>
                                                                                <TimelineConnector style={{background: red.txt}}/>
                                                                            </>
                                                                        )
                                                                    }
                                                                    </TimelineSeparator>
                                                                    <TimelineContent>
                                                                        <Paper elevation={3} style={{padding: 10}}>
                                                                            <Typography variant="button" component="h1" color="primary">{log.log_type.replace("LOG", "").replaceAll("_", " ")}</Typography>
                                                                            <Typography>{log.log_msg}</Typography>
                                                                        </Paper>
                                                                    </TimelineContent>
                                                                </TimelineItem>
                                                            ))
                                                        }
                                                    </Timeline>
                                                ) : (
                                                    <Typography>No logs</Typography>
                                                )
                                            }
                                        </TabPanel>
                                        <TabPanel className={classes.scroll} value="1" style={{padding: 0, overflowY: "auto"}}>
                                            <Box style={{padding: 10}}>
                                                {
                                                    deviceData.cert ? (
                                                        <>
                                                            <Box style={{display: "flex"}}>
                                                                <Typography variant="button" style={{minWidth: 150}}>CA Name</Typography>
                                                                <Typography>{deviceData.cert.issuer_name}</Typography>
                                                            </Box>
                                                            <Box style={{display: "flex"}}>
                                                                <Typography variant="button" style={{minWidth: 150}}>Serial Number</Typography>
                                                                <Typography>{deviceData.cert.serial_number}</Typography>
                                                            </Box>
                                                            <div style={{background: "#333", padding: "10px 20px 10px 20px"}}>
                                                                <IconButton style={{position:"absolute", right: 50}} onClick={()=>{
                                                                    navigator.clipboard.writeText(deviceData.cert.crt).then(function() {
                                                                        console.log('Async: Copying to clipboard was successful!');
                                                                    }, function(err) {
                                                                        console.error('Async: Could not copy text: ', err);
                                                                    });                  
                                                                }}>
                                                                    <AssignmentOutlinedIcon style={{color: "white"}}/>
                                                                </IconButton>
                                                                <div style={{color: "white", fontSize: "small", maxWidth: 500, fontFamily: "monospace"}}>
                                                                    {deviceData.cert.crt}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ):(
                                                        <>
                                                            <Typography>This device has no cert</Typography>
                                                        </>
                                                    )
                                                }
                                            </Box>
                                        </TabPanel>
                                        <TabPanel className={classes.scroll} value="2" style={{padding: 0, overflowY: "auto"}}>
                                            <Box style={{height: "50vh"}}>
                                                <DataGrid
                                                    classes={{root: classes.cell}}
                                                    components={{
                                                        Toolbar: GridToolbar,
                                                        NoRowsOverlay: EmptyOverlayGrid
                                                    }}
                                                    rows={gridData}
                                                    columns={columns}
                                                    autoPageSize={true}
                                                />
                                            </Box>
                                        </TabPanel>
                                    </TabContext>
                                    
                                </Box>
                            </>
                        ) : (
                            <></>
                        )
                    }                  
                       
                </Box>
                <LamassuModalPolyphormic handleClose={()=>resetModal()} {...modalInfo}/>
            </Box>    
        </>
    )
}

export { DeviceInspect }