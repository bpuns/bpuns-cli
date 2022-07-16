#!/usr/bin/env node
import process from 'process'
import root from 'src/command'
import { COMMAND } from './constant'

const command = process.argv.slice(2)
root.find(command as COMMAND[])