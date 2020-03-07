#!/bin/bash

FAKE_DIR=$(cd "$( dirname "$0" )" && pwd)
VOLUME_DIR=$FAKE_DIR/../dirContent_primaryVolume
ASSEMBLER_PATH=$FAKE_DIR/../../../breadbytecode-asm

node $ASSEMBLER_PATH/dist/assemble.js $FAKE_DIR/initable.biasm
mv $FAKE_DIR/initable $VOLUME_DIR/dirContent_system/dirContent_ifaces/dirContent_initable/dirContent_ver_1_0_0/fileContent_main

node $ASSEMBLER_PATH/dist/assemble.js $FAKE_DIR/test.bbasm
mv $FAKE_DIR/test $VOLUME_DIR/dirContent_bootApps/fileContent_test


