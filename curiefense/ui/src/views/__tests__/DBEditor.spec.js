import DBEditor from '@/views/DBEditor'
import {describe, test, expect, jest, beforeEach, afterEach} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import GitHistory from '@/components/GitHistory'
import Vue from 'vue'

jest.mock('axios')
import axios from 'axios'

describe('DBEditor.vue', () => {
    let wrapper
    let dbData
    let dbKeyLogs
    beforeEach(async () => {
        dbData = {
            'publishinfo': {
                'buckets': [{'name': 'prod', 'url': 's3://curiefense-test01/prod'}, {
                    'name': 'devops',
                    'url': 's3://curiefense-test01/devops'
                }],
                'branch_buckets': [{'name': 'master', 'buckets': ['prod']}, {'name': 'devops', 'buckets': ['devops']}]
            },
            'autocomplete': {'tags': ['china', 'ukraine', 'internal', 'devops', 'google', 'yahoo', 'localhost', 'tor', 'bad-people', 'dev', 'test-tag', 'all', '', 'okay']}
        }
        dbKeyLogs = [{
            'author': 'Curiefense API',
            'email': 'curiefense@reblaze.com',
            'date': '2020-11-10T09:41:31+02:00',
            'message': 'Setting key [publishinfo] in database [system]',
            'version': 'b104d3dd17f790b75c4e067c44bb06b914902d78',
            'parents': ['ff59eb0e6d230c077dfa503c9f2d4aacec1b72ab']
        }, {
            'author': 'Curiefense API',
            'email': 'curiefense@reblaze.com',
            'date': '2020-08-27T16:19:58+00:00',
            'message': 'Added database [system]',
            'version': 'ff59eb0e6d230c077dfa503c9f2d4aacec1b72ab',
            'parents': ['a34f979217215060861b58b3f270e82580c20efb']
        }]
        axios.get.mockImplementation((path) => {
            if (path === '/conf/api/v1/db/') {
                return Promise.resolve({data: ['system', 'databaseCopy', 'anotherDB']})
            }
            const db = wrapper.vm.selectedDB
            const key = wrapper.vm.selectedKey
            if (path === `/conf/api/v1/db/new database/`) {
                return Promise.resolve({data: {key: {}}})
            }
            if (path === `/conf/api/v1/db/${db}/`) {
                return Promise.resolve({data: dbData})
            }
            if (path === `/conf/api/v1/db/${db}/k/${key}/v/`) {
                return Promise.resolve({data: dbKeyLogs})
            }
            Promise.resolve({data: {}})
        })
        wrapper = shallowMount(DBEditor)
        await Vue.nextTick()
    })
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should log message when receiving no databases from the server', (done) => {
        const originalLog = console.log
        let consoleOutput = []
        const mockedLog = output => consoleOutput.push(output)
        consoleOutput = []
        console.log = mockedLog
        axios.get.mockImplementation((path) => {
            if (path === '/conf/api/v1/db/') {
                return Promise.resolve({data: []})
            }
            Promise.resolve({data: {}})
        })
        wrapper = shallowMount(DBEditor)
        // allow all requests to finish
        setImmediate(() => {
            expect(consoleOutput).toContain(`failed loading database, none are present!`)
            console.log = originalLog
            done()
        })
    })

    test('should be able to switch databases through dropdown', (done) => {
        const databaseSelection = wrapper.find('.database-selection')
        databaseSelection.trigger('click')
        const options = databaseSelection.findAll('option')
        options.at(1).element.selected = true
        databaseSelection.trigger('change')
        // allow all requests to finish
        setImmediate(() => {
            expect(databaseSelection.element.selectedIndex).toEqual(1)
            done()
        })
    })

    test('should be able to switch key through dropdown', (done) => {
        const keySelection = wrapper.find('.key-selection')
        keySelection.trigger('click')
        const options = keySelection.findAll('option')
        options.at(1).element.selected = true
        keySelection.trigger('change')
        // allow all requests to finish
        setImmediate(() => {
            expect(keySelection.element.selectedIndex).toEqual(1)
            done()
        })
    })

    test('should send API request to restore to the correct version', async () => {
        const wantedVersion = {
            version: 'b104d3dd17f790b75c4e067c44bb06b914902d78'
        }
        let putSpy
        axios.put.mockImplementation(() => Promise.resolve())
        putSpy = jest.spyOn(axios, 'put')
        const gitHistory = wrapper.findComponent(GitHistory)
        gitHistory.vm.$emit('restoreVersion', wantedVersion)
        await Vue.nextTick()
        expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/system/v/${wantedVersion.version}/revert/`)
    })

    describe('database action buttons', () => {
        test('should be able to fork database', async () => {
            const dbData = wrapper.vm.selectedDBData
            axios.put.mockImplementation(() => Promise.resolve())
            const putSpy = jest.spyOn(axios, 'put')
            const forkDatabaseButton = wrapper.find('.fork-database-button')
            forkDatabaseButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/copy of system/`, dbData)
        })

        test('should be able to add a new database', async () => {
            const newDatabase = {
                key: {}
            }
            axios.put.mockImplementation(() => Promise.resolve())
            const putSpy = jest.spyOn(axios, 'put')
            const newDatabaseButton = wrapper.find('.new-database-button')
            newDatabaseButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/new database/`, newDatabase)
        })

        test('should be able to delete a database', (done) => {
            axios.put.mockImplementation(() => Promise.resolve())
            axios.delete.mockImplementation(() => Promise.resolve())
            const deleteSpy = jest.spyOn(axios, 'delete')
            // create new database so we can delete it
            const newDatabaseButton = wrapper.find('.new-database-button')
            newDatabaseButton.trigger('click')
            setImmediate(async () => {
                const databaseName = wrapper.vm.selectedDB
                const deleteDatabaseButton = wrapper.find('.delete-database-button')
                deleteDatabaseButton.trigger('click')
                await Vue.nextTick()
                expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v1/db/${databaseName}/`)
                done()
            })
        })

        test('should not be able to delete the `system` database', async () => {
            axios.delete.mockImplementation(() => Promise.resolve())
            const deleteSpy = jest.spyOn(axios, 'delete')
            const deleteDatabaseButton = wrapper.find('.delete-database-button')
            deleteDatabaseButton.trigger('click')
            await Vue.nextTick()
            expect(deleteSpy).not.toHaveBeenCalled()
        })
    })

    describe('key action buttons', () => {
        test('should be able to fork key', async () => {
            const doc = JSON.parse(wrapper.vm.document)
            axios.put.mockImplementation(() => Promise.resolve())
            const putSpy = jest.spyOn(axios, 'put')
            const forkKeyButton = wrapper.find('.fork-key-button')
            forkKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/system/k/copy of publishinfo/`, doc)
        })

        test('should be able to add a new key', async () => {
            const newKey = {}
            axios.put.mockImplementation(() => Promise.resolve())
            const putSpy = jest.spyOn(axios, 'put')
            const newKeyButton = wrapper.find('.new-key-button')
            newKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/system/k/new key/`, newKey)
        })

        test('should be able to delete a key', (done) => {
            axios.put.mockImplementation(() => Promise.resolve())
            axios.delete.mockImplementation(() => Promise.resolve())
            const deleteSpy = jest.spyOn(axios, 'delete')
            // create new key so we can delete it
            const newKeyButton = wrapper.find('.new-key-button')
            newKeyButton.trigger('click')
            setImmediate(async () => {
                const keyName = wrapper.vm.selectedKey
                const deleteKeyButton = wrapper.find('.delete-key-button')
                deleteKeyButton.trigger('click')
                await Vue.nextTick()
                expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v1/db/system/k/${keyName}/`)
                done()
            })
        })

        test('should not be able to delete a `publishinfo` key under `system` database', async () => {
            axios.delete.mockImplementation(() => Promise.resolve())
            const deleteSpy = jest.spyOn(axios, 'delete')
            const deleteKeyButton = wrapper.find('.delete-key-button')
            deleteKeyButton.trigger('click')
            await Vue.nextTick()
            expect(deleteSpy).not.toHaveBeenCalled()
        })
    })

    describe('save changes button', () => {
        let putSpy
        beforeEach((done) => {
            // create a new database for empty environment to test changes on
            axios.put.mockImplementation(() => Promise.resolve())
            const newDatabaseButton = wrapper.find('.new-database-button')
            newDatabaseButton.trigger('click')
            // allow all requests to finish
            setImmediate(() => {
                jest.clearAllMocks()
                putSpy = jest.spyOn(axios, 'put')
                done()
            })
        })

        test('should be able to save database changes even if database name changes', async (done) => {
            const databaseNameInput = wrapper.find('.database-name-input')
            databaseNameInput.element.value = 'newDB'
            databaseNameInput.trigger('input')
            await Vue.nextTick()
            const keyNameInput = wrapper.find('.key-name-input')
            keyNameInput.element.value = 'key_name'
            keyNameInput.trigger('input')
            await Vue.nextTick()
            const doc = {
                buckets: {},
                foo: 'bar'
            }
            wrapper.vm.document = JSON.stringify(doc)
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            // allow all requests to finish
            setImmediate(() => {
                expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/newDB/k/key_name/`, doc)
                done()
            })
        })

        test('should be able to save key changes even if key name changes', async () => {
            const keyNameInput = wrapper.find('.key-name-input')
            keyNameInput.element.value = 'key_name'
            keyNameInput.trigger('input')
            await Vue.nextTick()
            const doc = {
                buckets: {},
                foo: 'bar'
            }
            wrapper.vm.document = JSON.stringify(doc)
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/new database/k/key_name/`, doc)
        })

        test('should be able to save key changes', async () => {
            const doc = {
                buckets: {},
                foo: 'bar'
            }
            wrapper.vm.document = JSON.stringify(doc)
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/db/new database/k/key/`, doc)
        })

        test('should not be able to save key changes if document is an invalid json', async () => {
            const doc = '{'
            const documentInput = wrapper.find('.document-input')
            documentInput.element.value = doc
            documentInput.trigger('input')
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).not.toHaveBeenCalled()
        })

        test('should not be able to save key changes if database name is empty', async () => {
            const databaseNameInput = wrapper.find('.database-name-input')
            databaseNameInput.element.value = ''
            databaseNameInput.trigger('input')
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).not.toHaveBeenCalled()
        })

        test('should not be able to save key changes if database name is duplicate of another database', async () => {
            const databaseNameInput = wrapper.find('.database-name-input')
            databaseNameInput.element.value = 'databaseCopy'
            databaseNameInput.trigger('input')
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).not.toHaveBeenCalled()
        })

        test('should not be able to save key changes if key name is empty', async () => {
            const keyNameInput = wrapper.find('.key-name-input')
            keyNameInput.element.value = ''
            keyNameInput.trigger('input')
            await Vue.nextTick()
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).not.toHaveBeenCalled()
        })

        test('should not be able to save key changes if key name is duplicate of another key', async () => {
            // add a new key so we would have multiple keys
            const newKeyButton = wrapper.find('.new-key-button')
            newKeyButton.trigger('click')
            // click event
            await Vue.nextTick()
            // key switch
            await Vue.nextTick()
            // change key name
            const keyNameInput = wrapper.find('.key-name-input')
            keyNameInput.element.value = 'key'
            keyNameInput.trigger('input')
            await Vue.nextTick()
            // reset spy counter
            jest.clearAllMocks()
            putSpy = jest.spyOn(axios, 'put')
            // attempt saving duplicate named key
            const saveKeyButton = wrapper.find('.save-button')
            saveKeyButton.trigger('click')
            await Vue.nextTick()
            expect(putSpy).not.toHaveBeenCalled()
        })
    })
})
