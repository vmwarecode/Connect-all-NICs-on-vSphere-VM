// Copyright 2016, VMware, Inc. All Rights Reserved
//
// VMware vRealize Orchestrator action sample
// 
// Checks the 'Connected' and 'Connect at power on' setting for every Network Adapter on a VM.
// If the value is false, the workflow will update the setting to true on the Network Adapter.
// VM can be powered off or powered on.  All changes applied with a single vm reconfig task
//
//Action Inputs:
// vm  -  VC:VirtualMachine
//
//Return type: void


var nicsToUpdate = [];
var changeVersion = vm.config.changeVersion;
var devices = vm.config.hardware.device;

for (var i in devices) {
	if (isNic(devices[i])) {
		System.debug(devices[i].deviceInfo.label+" : startConnected="+devices[i].connectable.startConnected );
		if (devices[i].connectable.startConnected == false) {
			//NIC is not configured to connect on startup.  Let's fix that.
			System.log("Nic: "+devices[i].deviceInfo.label+" is configured to not connect on start.  Fixing.");
			var nicToConnect = devices[i];
			nicToConnect.connectable.startConnected = true;
			nicToConnect.connectable.connected = true;
			var devChangeSpec = new VcVirtualDeviceConfigSpec();
			devChangeSpec.device = nicToConnect;
			devChangeSpec.operation = VcVirtualDeviceConfigSpecOperation.edit;
			nicsToUpdate.push(devChangeSpec);
		}
	}
}

if (nicsToUpdate.length > 0) {
	var configSpec = new VcVirtualMachineConfigSpec();		
	configSpec.changeVersion = changeVersion;
	configSpec.deviceChange = nicsToUpdate;
	var task = vm.reconfigVM_Task(configSpec);
	var result = System.getModule("com.vmware.library.vc.basic").vim3WaitTaskEnd(task,true,2);
}


function isNic(device) {
	if (devices[i] instanceof VcVirtualVmxnet3
		|| devices[i] instanceof VcVirtualE1000
		|| devices[i] instanceof VcVirtualE1000e
		|| devices[i] instanceof VcVirtualPCNet32
		|| devices[i] instanceof VcVirtualVmxnet
		|| devices[i] instanceof VcVirtualVmxnet2 ) {
		return true;
	} else {
		return false;
	}
}